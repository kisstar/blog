# 绘制两个三角形

在本次的实现中我们将使用 OpenGL 来进行绘制。OpenGL 自身是一个巨大的状态机，一系列的变量描述 OpenGL 此刻应当如何运行。

OpenGL 的状态通常被称为 OpenGL 上下文。我们通常可以通过设置选项，操作缓冲来更改 OpenGL 状态。最后，我们使用当前 OpenGL 上下文来渲染。

## 创建窗口

在我们画出出色的效果之前，首先要做的就是创建一个 OpenGL 上下文和一个用于显示的窗口。

GLFW 是一个专门针对 OpenGL 的 C 语言库，它提供了一些渲染物体所需的最低限度的接口。它允许用户创建 OpenGL 上下文、定义窗口参数以及处理用户输入。

因为 OpenGL 只是一个标准/规范，具体的实现是由驱动开发商针对特定显卡实现的。由于 OpenGL 驱动版本众多，它大多数函数的位置都无法在编译时确定下来，需要在运行时查询。所以任务就落在了开发者身上，开发者需要在运行时获取函数地址并将其保存在一个函数指针中供以后使用。取得地址的方法因平台而异，GLAD 是一个开源的库，它帮我们解决了这类繁琐的问题。

```cpp
#include <iostream>
#include <glad/glad.h>
#include <GLFW/glfw3.h>

void framebuffer_size_callback(GLFWwindow *window, int width, int height)
{
    glViewport(0, 0, width, height);
}

void processInput(GLFWwindow *window)
{
    if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);
}

int main()
{
    if (!glfwInit()) // 初始化 GLFW
    {
        std::cerr << "Could not initialize GLFW!" << std::endl;

        return 1;
    }

    // 配置 GLFW
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE); // for macOS

    // 创建窗口
    GLFWwindow *window = glfwCreateWindow(800, 600, "CG Tutorial", NULL, NULL);

    if (window == NULL)
    {
        std::cout << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return -1;
    }

    // 通知 GLFW 将我们窗口的上下文设置为当前线程的主上下文
    glfwMakeContextCurrent(window);

    // 初始化 GLAD
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
    {
        std::cout << "Failed to initialize GLAD" << std::endl;
        return -1;
    }

    // 告诉 OpenGL 渲染窗口的尺寸大小，即视口
    glViewport(0, 0, 800, 600);
    // 告诉 GLFW 我们希望每当窗口调整大小的时候调用这个函数
    glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);

    // 渲染循环
    while (!glfwWindowShouldClose(window)) // 检查一次 GLFW 是否被要求退出
    {
        // 输入
        processInput(window);

        // 渲染指令
        glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);

        // 检查并调用事件，交换缓冲
        glfwSwapBuffers(window); // 交换颜色缓冲
        glfwPollEvents();        // 函数检查有没有触发什么事件、更新窗口状态，并调用对应的回调函数
    }

    glfwTerminate();

    return 0;
}
```

## 着色器程序

现代 OpenGL 需要我们至少设置一个顶点和一个片段着色器。

在示例中，我们在顶点着色器中使用 `layout(location = 0)` 把顶点属性的位置值设置为 0，同时在配置数据的部分通过 glVertexAttribPointer() 函数指定我们要配置的顶点属性也写入 0，以便把数据传递到这一个顶点属性中。

片段着色器所做的是计算像素最后的颜色输出。

```cpp
#define STRINGIZE(x) #x
#define SHADER_STRING(text) STRINGIZE(text)

const std::string vertexString = SHADER_STRING(
    // 设定了输入变量的位置值
    layout(location = 0) in vec3 aPos;

    void main() {
        // 为了设置顶点着色器的输出，我们必须把位置数据赋值给预定义的 gl_Position 变量，它在幕后是 vec4 类型的
        // 在真实的程序里输入数据通常都不是标准化设备坐标，所以我们首先必须先把它们转换至 OpenGL 的可视区域内
        gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
    });

const std::string fragString = SHADER_STRING(
    // 片段着色器只需要一个输出变量，这个变量是一个 4 分量向量，它表示的是最终的输出颜色
    out vec4 FragColor;

    void main() {
        FragColor = vec4(1.0f, 0.5f, 0.2f, 1.0f);
    });

int createProgram(const std::string &vertexSource, const std::string &fragmentSource)
{
    const std::string preString = "\
    #version 330 \n\
    ";
    std::string vertexCombineSource = preString + vertexSource;
    std::string fragmentCombineSource = preString + fragmentSource;
    const char *vertexResultStr = vertexCombineSource.c_str();
    const char *fragmentResultStr = fragmentCombineSource.c_str();

    // 编译顶点着色器
    unsigned int vertexShader;
    vertexShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertexShader, 1, &vertexResultStr, NULL);
    glCompileShader(vertexShader);

    // 编译片段着色器
    unsigned int fragmentShader;
    fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragmentShader, 1, &fragmentResultStr, NULL);
    glCompileShader(fragmentShader);

    unsigned int shaderProgram;
    shaderProgram = glCreateProgram();
    glAttachShader(shaderProgram, vertexShader);
    glAttachShader(shaderProgram, fragmentShader);
    glLinkProgram(shaderProgram);
    // (glUseProgram(shaderProgram)); // 激活程序对象
    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);

    return shaderProgram;
}
```

## 顶点数据

开始绘制图形之前，我们需要先给 OpenGL 输入一些顶点数据。

顶点着色器允许我们指定任何以顶点属性为形式的输入。这使其具有很强的灵活性的同时，它还的确意味着我们必须手动指定输入数据的哪一个部分对应顶点着色器的哪一个顶点属性。所以，我们必须在渲染前指定 OpenGL 该如何解释顶点数据。

为了避免重复设置相同的顶点属性，可以使用顶点数组对象，它可以像顶点缓冲对象那样被绑定，任何随后的顶点属性调用都会储存在这个 VAO 中。当配置顶点属性指针时，就只需要将那些调用执行一次，之后再绘制物体的时候只需要绑定相应的 VAO 就行了。

更进一步，为了提高顶点的复用率，我们可以使用元素缓冲区对象通过设定绘制顶点的顺序来重复利用相同的顶点，和 VBO 类似，我们会把这些函数调用放在绑定和解绑函数调用之间。

```cpp
int createVAO()
{
    float vertices[] = {
        0.5f, 0.5f, 0.0f,   // 右上角
        0.5f, -0.5f, 0.0f,  // 右下角
        -0.5f, -0.5f, 0.0f, // 左下角
        -0.5f, 0.5f, 0.0f   // 左上角
    };
    unsigned int indices[] = {
        0, 1, 3, // 第一个三角形
        1, 2, 3  // 第二个三角形
    };

    // 生成一个 VBO 对象
    unsigned int VBO;
    glGenBuffers(1, &VBO);
    // 生成一个 EBO 对象
    unsigned int EBO;
    glGenBuffers(1, &EBO);
    // 生成一个 VAO 对象
    unsigned int VAO;
    glGenVertexArrays(1, &VAO);

    // 绑定 VAO
    // 顶点数组对象可以像顶点缓冲对象那样被绑定，任何随后的顶点属性调用都会储存在这个 VAO 中
    // 通过 VAO，当配置顶点属性指针时，你只需要将那些调用执行一次，之后再绘制物体的时候只需要绑定相应的 VAO 即可
    glBindVertexArray(VAO);

    // 绑定缓冲类型（此处是元素缓冲区对象），把索引数据复制到缓冲的内存中
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);
    // 绑定缓冲类型（此处是顶点缓冲对象），把顶点数据复制到缓冲的内存中
    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
    // 告诉 OpenGL 该如何解析顶点数据
    glVertexAttribPointer(0 /* 指定要配置的顶点属性 */,
                          3 /* 顶点属性的大小 */,
                          GL_FLOAT /* 数据的类型 */,
                          GL_FALSE /* 是否标准化 */,
                          3 * sizeof(float) /* 步长 */,
                          (void *)0 /* 位置数据在缓冲中起始位置的偏移量 */);
    // 启用顶点属性
    glEnableVertexAttribArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, 0); // 解除绑定的顶点缓冲区对象
    // glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0); // 当 VAO 是活动的时，不解除对 EBO 的绑定

    // 解绑 VAO
    glBindVertexArray(0);

    return VAO;
}
```

## 渲染

在准备好程序和数据之后，我们就可以开始渲染了。

首先，我们在渲染指令中通过 glUseProgram() 函数激活创建的着色器程序对象，并通过 glBindVertexArray() 绑定 VAO。

由于传递了 GL_ELEMENT_ARRAY_BUFFER 当作缓冲目标，所以我们需要用 glDrawElements() 来替换 glDrawArrays() 函数进行绘制。

```cpp
int main()
{

    // ...
    // 创建并编译着色器程序
    int shaderProgram = createProgram(vertexString, fragString);
    int VAO = createVAO();

    // 渲染循环
    while (!glfwWindowShouldClose(window)) // 检查一次 GLFW 是否被要求退出
    {
        // ...
        // 渲染指令
        glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);
        glUseProgram(shaderProgram);
        glBindVertexArray(VAO);
        // glDrawArrays(GL_TRIANGLES, 0, 3);
        glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
        // ...
    }
    // ...
}
```

现在，我们通过绘制 2 个三角形完成了一个矩形的绘制。
