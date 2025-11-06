---
title: "错误处理的三种风格：我的实践经验"
description: "异常、错误码和 Result 的实际使用感受"
date: "2025-01-26"
category: "Coding"
tags: ["错误处理", "Rust", "Java", "C", "工程实践"]
---

## 前言

这篇文章分享我在不同项目中使用三种错误处理方式的真实体验。

**声明在前**：
- 这不是"Result 完胜异常"的文章
- 每种方式都有适用场景
- 我更喜欢 Result，但这是个人偏好
- **选哪个不重要，把错误处理好才重要**

### 背景

我写过的项目：
- **Java Web 项目**：用异常处理业务逻辑
- **C 嵌入式项目**：用错误码处理硬件交互
- **Rust 后端服务**：用 Result 处理 API 请求

三种方式都用过，都有好有坏。

## 引子：错误处理的本质

写代码这么多年，发现最让人头疼的不是算法多复杂，而是**错误什么时候冒出来，冒出来后该怎么办**。

程序员常用的错误处理方式分三类：

1. **异常机制（Exceptions）**：Java/C++/Python 等
2. **错误码（errcode）**：C/Go（部分）
3. **Result 类型**：Rust、Haskell、OCaml 等

每种都能完成工作，但体验不同。下面分享我的真实经历。

---

## 一、异常：用习惯了也挺好

### Java 的 try-catch 体验

异常的初衷是解耦"正常逻辑"和"错误处理"。简单场景下确实挺好用：


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
于是现在很多的业务处理代码变成了如下+一堆的SpringAOP处理+Final Exception Controller

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

**我遇到的问题**：
* **控制流不直观**：异常可以从任何地方抛出，调试时经常要追踪半天
* **业务重试很麻烦**：重试、回滚这些业务操作，用 try-catch 写很绕
* **异常层次纠结**：该自定义异常还是用标准异常？该继承哪个？
* **性能问题**：创建异常对象有开销（虽然大多数时候不是瓶颈）

**但也有好处**：
* **栈追踪很有用**：调试时能看到完整调用栈
* **简单场景很方便**：读个配置文件，try-catch 就搞定
* **团队都熟悉**：Java 项目里大家都会用

### C++ 的异常：更复杂的场景

C++ 的异常要考虑资源管理：

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

**实际经历**：C++ 项目里写异常安全的代码需要很小心。很多团队干脆禁用异常，用错误码。

---

## 二、错误码：简单直接但需要纪律

### C 语言的错误码

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

**优点很明显**：
- 简单直接，性能好
- 完全在你掌控中
- 适合嵌入式、系统编程

**问题也很明显**：

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

* **错误码语义不明确**：-1、-2、-3 代表啥？得查文档
* **代码冗长**：每次调用都要 `if (ret != 0)` 检查
* **容易忘记检查**：编译器不会提醒你
* **多线程问题**：`errno` 在多线程下容易出错

**实际经历**：在嵌入式项目中，错误码是最实用的方案。性能好，开销小，适合资源受限的环境。

### C++ 的改进：std::expected

C++23 引入了 `std::expected`，很接近 Rust 的 Result：

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

**评价**：方向是对的，但 C++23 还不够普及，生态也不如 Rust 完善。

---

## 三、Result：我最喜欢的方式（但不是唯一正确的）

### Rust 的 Result

Rust 的 `Result<T, E>` 设计很简单：

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

**我喜欢 Result 的原因**：

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

而且对于需要经常通过调用栈来实现业务debug的工作来说, 其实也很方便

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

## 六、所以该用哪个？

### 没有"最好"，只有"合适"

**现实情况**：
- Java 项目里，异常是标准做法，团队都会用
- C 嵌入式项目，错误码是唯一选择
- Rust/Go 项目，Result/error 是惯例

**三种方式都能写出好代码，也都能写出烂代码。**

### 我个人的偏好

我更喜欢 Result，因为：
1. **编译器强制检查**：不会漏掉错误处理
2. **类型系统帮忙**：错误类型明确
3. **组合性好**：链式调用很舒服
4. **适合我的思维**：我喜欢显式处理错误

但这是**个人偏好**，不代表它就是"最好的"。

### 实用建议

**选择错误处理方式时**：

1. **看项目语言**：
   - Java/Python/C# → 异常（因为这是标准）
   - C/嵌入式 → 错误码（因为性能和资源）
   - Rust/OCaml → Result（因为语言设计就是这样）

2. **看团队习惯**：
   - 团队都会异常？别强推 Result
   - 团队习惯错误码？别强推异常
   
3. **看性能要求**：
   - 高频调用、低延迟 → 错误码
   - 普通业务逻辑 → 随便选
   - 系统编程 → 错误码或 Result

### 最重要的：Get Work Done

无论用哪种方式，关键是：
- ✅ **错误要处理好**：别让程序莫名其妙崩溃
- ✅ **日志要记清楚**：方便调试和排查
- ✅ **让调用者能恢复**：提供有用的错误信息
- ❌ **别纠结工具**：花时间写代码，别花时间争论

**好的错误处理不是为了消除错误，而是让错误可控、可预测、可恢复。**

这跟用什么语言、什么机制无关。

**P.S.** 如果你想学 Rust 的错误处理，那确实值得一试。但如果你的 Java/C++ 项目跑得好好的，没必要为了"更好的错误处理"就重写。能把现有工具用好，比追求"完美工具"更重要。

修正于 2025-11-06