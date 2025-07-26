---
title: "为什么我更欣赏 Monad 式的错误处理"
description: "Result、Exception 和 errcode 的一场结构化对话"
date: "2025-01-26"
category: "编程思考"
tags: ["Rust", "Monad", "错误处理", "函数式编程"]
---
---

# 为什么我更欣赏 Monad 式的错误处理

> ——一个被异常折磨过的程序员的自白

---

## 引子：那些年我们踩过的错误处理坑

写代码这么多年，我发现最让人头疼的不是算法有多复杂，而是**错误什么时候冒出来，以及冒出来之后该怎么办**。

还记得第一次写 Java 的时候，看到 `NullPointerException` 就像见鬼一样——程序好好的跑着，突然就崩了，而且往往是在最不该崩的时候。后来转 C++，开始手动管理内存，异常安全成了噩梦。再后来写 C，每个函数调用后都要检查返回值，代码变成了无穷无尽的 `if (ret != 0) return ret;`。

直到接触 Rust，我才意识到：**错误处理不是程序的附属品，它本身就是程序逻辑的一部分**。

程序员常用的错误处理方式大致可以分为三类：

1. **异常机制（Exceptions）**：Java/C++/Python 等
2. **错误码（errcode）**：C/C++（C 风格）
3. **代数数据类型（ADT）或 Monad（如 Result）**：Rust、Haskell、Scala 等

从个人血泪经验来看，**Monad 式的错误处理（以 Rust 的 `Result` 为代表）在安全性、组合性和可维护性方面更具优势**。这不是"新潮的正确"，而是一种更务实、更贴近现实的软件工程选择。

---

## 一、异常：跳转式控制流的温柔陷阱

### Java：看起来很美的 try-catch

异常最初是为了解耦"正常逻辑"和"错误路径"而生。Java 的语法看起来确实很优雅：


```java
// 看起来很清晰的文件读取
public String readConfig(String filename) {
    try {
        return Files.readString(Paths.get(filename));
    } catch (IOException e) {
        logger.error("Failed to read config: " + e.getMessage());
        return getDefaultConfig();
    }
}
```


但当你开始写复杂一点的逻辑时，问题就来了：

```java
// 现实中的代码往往是这样的
public User processUserData(String userId) throws ServiceException {
    try {
        String userData = userService.fetchUser(userId); // 可能抛 NetworkException
        User user = jsonParser.parse(userData);          // 可能抛 ParseException
        user.validate();                                 // 可能抛 ValidationException
        auditService.log(user);                         // 可能抛 AuditException
        return user;
    } catch (NetworkException e) {
        // 网络问题，应该重试吗？
        throw new ServiceException("Network error", e);
    } catch (ParseException e) {
        // 数据格式错误，记日志？返回默认值？
        throw new ServiceException("Invalid data format", e);
    } catch (ValidationException e) {
        // 验证失败，需要通知用户？
        throw new ServiceException("Validation failed", e);
    } catch (AuditException e) {
        // 审计失败，但用户数据是好的，怎么办？
        logger.warn("Audit failed but continuing", e);
        return user; // 这里的 user 变量还在作用域内吗？
    }
}
```

你很快会发现问题：

* **控制流变得混乱**：异常可能从任何地方抛出，程序的执行路径变得不可预测
* **资源管理噩梦**：在 Java 里还好有 try-with-resources，但在 C++ 里你就得祈祷 RAII 救你
* **异常层次设计困难**：到底该继承哪个异常？自定义异常还是用标准异常？
* **性能损耗**：Java 的异常创建包含栈跟踪，开销不小

### C++：RAII 拯救不了的异常安全

C++ 的异常更加恐怖，因为它有析构函数：

```cpp
class ResourceManager {
    FILE* file_;
    void* buffer_;
public:
    ResourceManager(const char* filename) 
        : file_(fopen(filename, "r")), buffer_(malloc(1024)) {
        if (!file_) throw std::runtime_error("Cannot open file");
        if (!buffer_) {
            fclose(file_); // 手动清理，容易遗漏
            throw std::bad_alloc();
        }
    }
    
    ~ResourceManager() {
        if (file_) fclose(file_);
        if (buffer_) free(buffer_);
    }
    
    void process() {
        // 如果这里抛异常，析构函数会被调用
        // 但如果析构函数也抛异常，程序就会 terminate
        if (some_condition()) {
            throw std::logic_error("Processing failed");
        }
    }
};
```

异常安全编程在 C++ 里是一门艺术，需要考虑强异常保证、基本异常保证等等。大多数时候，程序员选择"不抛异常"，在一个有异常机制的语言里绕着异常走。

这就像给你一个降落伞，然后告诉你最好别用它。

---

## 二、errcode：纪律驱动的手工工艺品

### C 语言：一切都在你的掌控中（也都是你的责任）

C 语言没有异常，于是大家开始手动返回整数来代表错误状态：

```c
// 经典的 C 风格错误处理
int read_config(const char* filename, char* buffer, size_t bufsize) {
    FILE* file = fopen(filename, "r");
    if (!file) {
        return -1; // 文件打开失败
    }
    
    size_t bytes_read = fread(buffer, 1, bufsize - 1, file);
    if (ferror(file)) {
        fclose(file);
        return -2; // 读取失败
    }
    
    buffer[bytes_read] = '\0';
    fclose(file);
    return 0; // 成功
}

// 使用的时候
int main() {
    char config[1024];
    int ret = read_config("config.txt", config, sizeof(config));
    if (ret == -1) {
        fprintf(stderr, "Cannot open config file\n");
        return 1;
    } else if (ret == -2) {
        fprintf(stderr, "Cannot read config file\n");
        return 1;
    }
    
    // 继续处理...
    return 0;
}
```

这种方式简洁、明确、完全在你的掌控中。但问题也很明显：

```c
// 现实中的代码往往是这样的意大利面条
int complex_operation(const char* input, char* output) {
    int ret1 = step1(input);
    if (ret1 != 0) return ret1;
    
    int ret2 = step2(input);
    if (ret2 != 0) return ret2;
    
    int ret3 = step3(input, output);
    if (ret3 != 0) return ret3;
    
    int ret4 = step4(output);
    if (ret4 != 0) return ret4;
    
    return 0;
}
```

问题在于：

* **错误码语义不明确**：-1、-2、-3 到底代表什么？
* **重复性劳动**：每个函数调用后都要检查，代码变得冗长
* **容易遗漏**：编译器不会提醒你检查返回值
* **多线程陷阱**：`errno` 在多线程环境下是个定时炸弹

### C++ 的错误码进化

现代 C++ 开始引入更结构化的错误处理：

```cpp
#include <system_error>
#include <expected> // C++23

// 使用 std::error_code
std::error_code read_file(const std::string& filename, std::string& content) {
    std::ifstream file(filename);
    if (!file) {
        return std::make_error_code(std::errc::no_such_file_or_directory);
    }
    
    content = std::string(std::istreambuf_iterator<char>(file),
                         std::istreambuf_iterator<char>());
    
    if (file.bad()) {
        return std::make_error_code(std::errc::io_error);
    }
    
    return {}; // 成功
}

// 使用 std::expected (C++23)
std::expected<std::string, std::error_code> read_file_v2(const std::string& filename) {
    std::ifstream file(filename);
    if (!file) {
        return std::unexpected(std::make_error_code(std::errc::no_such_file_or_directory));
    }
    
    std::string content(std::istreambuf_iterator<char>(file),
                       std::istreambuf_iterator<char>());
    
    if (file.bad()) {
        return std::unexpected(std::make_error_code(std::errc::io_error));
    }
    
    return content;
}
```

这已经很接近 Rust 的 `Result` 了，但 C++ 的类型系统和语法糖支持还是差了一些。

---

## 三、Result：显式、结构化、组合良好的错误模型

### Rust 的基础 Result

Rust 的 `Result<T, E>` 是一个简单而强大的设计：

```rust
// Result 的定义很简单
enum Result<T, E> {
    Ok(T),
    Err(E),
}

// 一个简单的文件读取函数
use std::fs;
use std::io;

fn read_config(filename: &str) -> Result<String, io::Error> {
    fs::read_to_string(filename)
}

// 使用的时候必须处理错误
fn main() {
    match read_config("config.txt") {
        Ok(content) => println!("Config: {}", content),
        Err(e) => eprintln!("Error reading config: {}", e),
    }
}
```

但 Rust 真正强大的地方在于它的组合性：

```rust
// 使用 ? 操作符进行错误传播
fn process_config() -> Result<ProcessedConfig, Box<dyn std::error::Error>> {
    let content = fs::read_to_string("config.txt")?;
    let parsed: RawConfig = serde_json::from_str(&content)?;
    let processed = validate_and_transform(parsed)?;
    Ok(processed)
}

// 或者使用更具体的错误类型
#[derive(Debug)]
enum ConfigError {
    IoError(io::Error),
    ParseError(serde_json::Error),
    ValidationError(String),
}

impl From<io::Error> for ConfigError {
    fn from(err: io::Error) -> Self {
        ConfigError::IoError(err)
    }
}

impl From<serde_json::Error> for ConfigError {
    fn from(err: serde_json::Error) -> Self {
        ConfigError::ParseError(err)
    }
}

fn process_config_v2() -> Result<ProcessedConfig, ConfigError> {
    let content = fs::read_to_string("config.txt")?;
    let parsed: RawConfig = serde_json::from_str(&content)?;
    let processed = validate_and_transform(parsed)
        .map_err(|e| ConfigError::ValidationError(e.to_string()))?;
    Ok(processed)
}
```

### anyhow：让错误处理更人性化

实际项目中，`anyhow` 库让错误处理变得更加实用：

```rust
use anyhow::{Context, Result};

fn read_user_data(user_id: u64) -> Result<UserData> {
    let db_url = std::env::var("DATABASE_URL")
        .context("DATABASE_URL environment variable not set")?;
    
    let connection = establish_connection(&db_url)
        .context("Failed to connect to database")?;
    
    let user = fetch_user(&connection, user_id)
        .with_context(|| format!("Failed to fetch user with ID {}", user_id))?;
    
    let profile = fetch_user_profile(&connection, user_id)
        .context("Failed to fetch user profile")?;
    
    Ok(UserData { user, profile })
}

// 错误信息会自动串联，非常有用
fn main() {
    if let Err(e) = read_user_data(123) {
        eprintln!("Error: {:?}", e);
        // 输出类似：
        // Error: Failed to fetch user with ID 123
        // Caused by:
        //     0: Database query failed
        //     1: Connection timeout
    }
}
```

### thiserror：结构化错误定义

对于库开发，`thiserror` 让自定义错误变得简单：

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DataStoreError {
    #[error("Connection failed")]
    ConnectionFailed(#[from] io::Error),
    
    #[error("Invalid query: {query}")]
    InvalidQuery { query: String },
    
    #[error("User {user_id} not found")]
    UserNotFound { user_id: u64 },
    
    #[error("Permission denied for user {user_id}")]
    PermissionDenied { user_id: u64 },
}

// 使用起来很自然
fn get_user(user_id: u64) -> Result<User, DataStoreError> {
    if user_id == 0 {
        return Err(DataStoreError::InvalidQuery {
            query: "user_id cannot be 0".to_string(),
        });
    }
    
    // ... 其他逻辑
    
    Ok(user)
}
```

### Result 的函数式组合

Rust 的 `Result` 支持丰富的函数式操作：

```rust
use reqwest;
use serde_json::Value;

// 链式操作处理 HTTP 请求
fn fetch_and_process_data(url: &str) -> Result<ProcessedData, Box<dyn std::error::Error>> {
    reqwest::blocking::get(url)?
        .json::<Value>()?                           // 解析 JSON
        .get("data")                                // 获取 data 字段
        .and_then(|v| v.as_array())                // 转换为数组
        .ok_or("Invalid data format")?             // 处理 None 情况
        .iter()                                     // 迭代
        .map(|item| parse_item(item))              // 解析每个元素
        .collect::<Result<Vec<_>, _>>()?           // 收集结果
        .into_iter()                               // 再次迭代
        .fold(Ok(ProcessedData::new()), |acc, item| {  // 累积处理
            acc.and_then(|mut data| {
                data.add_item(item)?;
                Ok(data)
            })
        })
}

// 并行处理多个请求
fn fetch_multiple_users(user_ids: &[u64]) -> Result<Vec<User>, DataStoreError> {
    user_ids
        .iter()
        .map(|&id| get_user(id))
        .collect()  // 这会在第一个错误时停止
}

// 如果想要收集所有结果（包括错误）
fn fetch_multiple_users_tolerant(user_ids: &[u64]) -> (Vec<User>, Vec<DataStoreError>) {
    user_ids
        .iter()
        .map(|&id| get_user(id))
        .fold((Vec::new(), Vec::new()), |(mut users, mut errors), result| {
            match result {
                Ok(user) => users.push(user),
                Err(e) => errors.push(e),
            }
            (users, errors)
        })
}
```

---

## 四、对比：三种方式的实战较量

让我们通过一个实际的例子来比较三种错误处理方式。假设我们要实现一个用户认证系统：

### Java 异常版本

```java
public class AuthService {
    public AuthResult authenticate(String username, String password) 
            throws AuthException {
        try {
            // 1. 验证输入
            if (username == null || username.trim().isEmpty()) {
                throw new InvalidInputException("Username cannot be empty");
            }
            
            // 2. 查找用户
            User user = userRepository.findByUsername(username);
            if (user == null) {
                throw new UserNotFoundException("User not found: " + username);
            }
            
            // 3. 验证密码
            if (!passwordService.verify(password, user.getPasswordHash())) {
                auditService.logFailedLogin(username);
                throw new InvalidCredentialsException("Invalid password");
            }
            
            // 4. 检查用户状态
            if (!user.isActive()) {
                throw new AccountDisabledException("Account is disabled");
            }
            
            // 5. 生成令牌
            String token = tokenService.generateToken(user);
            auditService.logSuccessfulLogin(username);
            
            return new AuthResult(user, token);
            
        } catch (DatabaseException e) {
            throw new AuthException("Database error during authentication", e);
        } catch (TokenGenerationException e) {
            throw new AuthException("Failed to generate token", e);
        } catch (AuditException e) {
            // 审计失败不应该影响认证结果，但要记录
            logger.warn("Audit logging failed", e);
            // 这里怎么办？重新抛异常还是继续？
            throw new AuthException("System error", e);
        }
    }
}
```

### C 语言版本

```c
typedef enum {
    AUTH_SUCCESS = 0,
    AUTH_INVALID_INPUT = -1,
    AUTH_USER_NOT_FOUND = -2,
    AUTH_INVALID_CREDENTIALS = -3,
    AUTH_ACCOUNT_DISABLED = -4,
    AUTH_DATABASE_ERROR = -5,
    AUTH_TOKEN_ERROR = -6,
    AUTH_AUDIT_ERROR = -7,
    AUTH_MEMORY_ERROR = -8
} auth_result_t;

typedef struct {
    char username[256];
    char token[512];
    int user_id;
} auth_data_t;

auth_result_t authenticate(const char* username, const char* password, 
                          auth_data_t* result) {
    if (!username || strlen(username) == 0) {
        return AUTH_INVALID_INPUT;
    }
    
    if (!password || !result) {
        return AUTH_INVALID_INPUT;
    }
    
    // 查找用户
    user_t user;
    int ret = find_user_by_username(username, &user);
    if (ret == USER_NOT_FOUND) {
        return AUTH_USER_NOT_FOUND;
    } else if (ret != 0) {
        return AUTH_DATABASE_ERROR;
    }
    
    // 验证密码
    ret = verify_password(password, user.password_hash);
    if (ret == PASSWORD_MISMATCH) {
        // 记录失败尝试
        audit_log_failed_login(username); // 如果这个失败了怎么办？
        return AUTH_INVALID_CREDENTIALS;
    } else if (ret != 0) {
        return AUTH_DATABASE_ERROR;
    }
    
    // 检查用户状态
    if (!user.is_active) {
        return AUTH_ACCOUNT_DISABLED;
    }
    
    // 生成令牌
    char token[512];
    ret = generate_token(&user, token, sizeof(token));
    if (ret != 0) {
        return AUTH_TOKEN_ERROR;
    }
    
    // 记录成功登录
    ret = audit_log_successful_login(username);
    if (ret != 0) {
        // 令牌已经生成了，审计失败怎么办？
        // 返回错误还是忽略？
        return AUTH_AUDIT_ERROR;
    }
    
    // 填充结果
    strncpy(result->username, username, sizeof(result->username) - 1);
    result->username[sizeof(result->username) - 1] = '\0';
    strncpy(result->token, token, sizeof(result->token) - 1);
    result->token[sizeof(result->token) - 1] = '\0';
    result->user_id = user.id;
    
    return AUTH_SUCCESS;
}
```

### Rust Result 版本

```rust
use thiserror::Error;
use anyhow::Context;

#[derive(Error, Debug)]
pub enum AuthError {
    #[error("Invalid input: {message}")]
    InvalidInput { message: String },
    
    #[error("User not found: {username}")]
    UserNotFound { username: String },
    
    #[error("Invalid credentials")]
    InvalidCredentials,
    
    #[error("Account disabled")]
    AccountDisabled,
    
    #[error("Database error")]
    DatabaseError(#[from] DatabaseError),
    
    #[error("Token generation failed")]
    TokenError(#[from] TokenError),
    
    #[error("System error")]
    SystemError(#[from] anyhow::Error),
}

#[derive(Debug)]
pub struct AuthResult {
    pub user: User,
    pub token: String,
}

impl AuthService {
    pub async fn authenticate(&self, username: &str, password: &str) 
        -> Result<AuthResult, AuthError> {
        
        // 1. 验证输入
        if username.trim().is_empty() {
            return Err(AuthError::InvalidInput {
                message: "Username cannot be empty".to_string(),
            });
        }
        
        // 2. 查找用户
        let user = self.user_repository
            .find_by_username(username)
            .await?
            .ok_or_else(|| AuthError::UserNotFound {
                username: username.to_string(),
            })?;
        
        // 3. 验证密码
        if !self.password_service.verify(password, &user.password_hash)? {
            // 异步记录失败登录，不影响主流程
            let username = username.to_string();
            tokio::spawn(async move {
                if let Err(e) = audit_service.log_failed_login(&username).await {
                    tracing::warn!("Failed to log failed login: {}", e);
                }
            });
            
            return Err(AuthError::InvalidCredentials);
        }
        
        // 4. 检查用户状态
        if !user.is_active {
            return Err(AuthError::AccountDisabled);
        }
        
        // 5. 生成令牌
        let token = self.token_service.generate_token(&user)?;
        
        // 6. 记录成功登录（异步，不阻塞返回）
        let username = username.to_string();
        let audit_service = self.audit_service.clone();
        tokio::spawn(async move {
            if let Err(e) = audit_service.log_successful_login(&username).await {
                tracing::warn!("Failed to log successful login: {}", e);
            }
        });
        
        Ok(AuthResult { user, token })
    }
    
    // 批量认证用户
    pub async fn authenticate_batch(&self, credentials: &[(String, String)]) 
        -> Vec<Result<AuthResult, AuthError>> {
        
        // 并发处理，但保持错误信息
        futures::future::join_all(
            credentials.iter().map(|(username, password)| {
                self.authenticate(username, password)
            })
        ).await
    }
    
    // 容错的批量认证
    pub async fn authenticate_batch_tolerant(&self, credentials: &[(String, String)]) 
        -> (Vec<AuthResult>, Vec<(String, AuthError)>) {
        
        let results = self.authenticate_batch(credentials).await;
        
        results.into_iter()
            .zip(credentials.iter())
            .fold(
                (Vec::new(), Vec::new()),
                |(mut successes, mut failures), (result, (username, _))| {
                    match result {
                        Ok(auth_result) => successes.push(auth_result),
                        Err(error) => failures.push((username.clone(), error)),
                    }
                    (successes, failures)
                }
            )
    }
}
```

---

## 五、冷静思考：什么时候该用什么

### 异常适合的场景

异常并不是一无是处，它适合：

1. **真正的异常情况**：内存溢出、栈溢出、系统调用失败
2. **不可恢复的错误**：配置文件损坏、必要依赖不可用
3. **跨越多层调用栈的错误传播**：深层递归中的错误

```java
// 这种情况下异常是合理的
public void initializeSystem() throws SystemInitializationException {
    try {
        loadCriticalConfig();
        initializeDatabase();
        startServices();
    } catch (Exception e) {
        // 系统无法启动，抛异常让程序退出
        throw new SystemInitializationException("System initialization failed", e);
    }
}
```

### 错误码适合的场景

错误码适合：

1. **性能敏感的代码**：高频调用的底层函数
2. **系统编程**：操作系统接口、驱动程序
3. **需要明确控制流的场景**：实时系统

```c
// 高性能的数据处理函数
int process_packet(const uint8_t* data, size_t len, packet_t* result) {
    if (!data || len == 0 || !result) {
        return -EINVAL;
    }
    
    // 快速返回，没有额外开销
    if (len < MIN_PACKET_SIZE) {
        return -EMSGSIZE;
    }
    
    // ... 处理逻辑
    return 0;
}
```

### Result 适合的场景

Result 适合绝大多数业务逻辑：

1. **可预期的失败**：用户输入错误、资源不存在、权限不足
2. **需要组合的操作**：一系列可能失败的步骤
3. **类型安全要求高的场景**：需要明确区分不同错误类型

```rust
// 复杂的业务逻辑处理
async fn process_order(order_request: OrderRequest) -> Result<Order, OrderError> {
    let validated_request = validate_order_request(order_request)?;
    let inventory_check = check_inventory(&validated_request.items).await?;
    let payment_result = process_payment(&validated_request.payment).await?;
    let order = create_order(validated_request, inventory_check, payment_result)?;
    
    // 后续处理可以优雅地组合
    notify_customer(&order).await
        .map_err(|e| tracing::warn!("Failed to notify customer: {}", e))
        .ok(); // 通知失败不影响订单创建
    
    Ok(order)
}
```

---

## 六、最后的话：工程是关于权衡的艺术

写了这么多年代码，我越来越相信：**好的错误处理不是为了消除错误，而是为了让错误变得可控、可预测、可恢复**。

异常有它的历史地位，在处理真正"异常"的情况时仍然有用。错误码在系统编程和性能敏感的场景下不可替代。但对于现代应用开发，特别是业务逻辑复杂、并发性要求高的系统，**Monad 式的错误处理提供了更好的工程实践**。

它不是银弹，但它让我们：

1. **在编译期就知道什么地方可能出错**
2. **强制程序员面对和处理错误**
3. **提供了良好的组合性和可测试性**
4. **错误信息结构化，便于调试和监控**

最重要的是，**它让错误处理从"事后补救"变成了"设计的一部分"**。当你开始用 `Result` 思考问题时，你会发现自己在设计函数接口时就会考虑：这个函数可能以什么方式失败？调用者应该如何处理这些失败？

这种思维转变，比任何具体的语法糖都更有价值。

说到底，**错误处理的目标不是美观，而是可靠**。而在通往可靠系统的路上，Rust 的 `Result` 和整个生态系统（anyhow、thiserror 等）为我们提供了一条更加清晰的道路。

---

*P.S. 如果你还在犹豫要不要学 Rust，就冲着它的错误处理，也值得一试。毕竟，错误是程序员日常最多的"伙伴"，为什么不让这个伙伴更友好一些呢？*