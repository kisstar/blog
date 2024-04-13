# 变换

要想让静态的物体动起来，我们可以尝试着在每一帧改变物体的顶点并且重配置缓冲区从而使它们移动，但这太繁琐了，而且会消耗很多的处理时间。使用（多个）矩阵对象可以更好的变换一个物体。

## 旋转和缩放

让我们来旋转和缩放之前教程中的那个箱子。首先我们把箱子逆时针旋转 90 度。然后缩放 0.5 倍，使它变成原来的一半大。我们先来创建变换矩阵：

```cpp
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

glm::mat4 trans;
trans = glm::rotate(trans, glm::radians(90.0f), glm::vec3(0.0, 0.0, 1.0));
trans = glm::scale(trans, glm::vec3(0.5, 0.5, 0.5));
```

如何把矩阵传递给着色器？

GLSL 里也有一个 mat4 类型。所以我们将修改顶点着色器让其接收一个 mat4 的 uniform 变量，然后再用矩阵 uniform 乘以位置向量：

```cpp
const std::string vertexString = SHADER_STRING(
    // 设定了输入变量的位置值
    layout(location = 0) in vec3 aPos;
    layout(location = 1) in vec3 aColor;
    layout(location = 2) in vec2 aTexCoord;

    out vec3 ourColor;
    out vec2 TexCoord;

    uniform mat4 transform;

    void main() {
        ourColor = aColor;

        gl_Position = transform * vec4(aPos, 1.0f);
        TexCoord = vec2(aTexCoord.x, 1.0 - aTexCoord.y);
    });
```

最后就是把变换矩阵传递给着色器了：

```cpp
#include <glm/gtc/type_ptr.hpp>
#include <glad/glad.h>

unsigned int transformLoc = glGetUniformLocation(shaderProgram, "transform");
glUniformMatrix4fv(transformLoc, 1, GL_FALSE, glm::value_ptr(trans));
```

## 旋转动画

为了得到动态的效果，我们可以让箱子随着时间旋转，我们将相应的矩阵创建和传递放到一个函数中：

```cpp
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <glad/glad.h>

void transform(int shaderProgram)
{
    // create transformations
    glm::mat4 transform = glm::mat4(1.0f); // make sure to initialize matrix to identity matrix first
    // 把箱子放在窗口的右下角
    transform = glm::translate(transform, glm::vec3(0.5f, -0.5f, 0.0f));
    // 使用 GLFW 的时间函数来获取不同时间的角度
    transform = glm::rotate(transform, (float)glfwGetTime(), glm::vec3(0.0f, 0.0f, 1.0f));

    unsigned int transformLoc = glGetUniformLocation(shaderProgram, "transform");
    glUniformMatrix4fv(transformLoc, 1, GL_FALSE, glm::value_ptr(transform));
}
```

同时更新一下顶点着色器：

```cpp
const std::string vertexString = SHADER_STRING(
    // 设定了输入变量的位置值
    layout(location = 0) in vec3 aPos;
    layout(location = 1) in vec3 aColor;
    layout(location = 2) in vec2 aTexCoord;

    out vec3 ourColor;
    out vec2 TexCoord;

    uniform mat4 transform;

    void main() {
        ourColor = aColor;

        gl_Position = transform * vec4(aPos, 1.0f);
        TexCoord = vec2(aTexCoord.x, aTexCoord.y);
    });
```

最后，在渲染中

```cpp
int main()
{
    // ...
    // 渲染循环
    while (!glfwWindowShouldClose(window)) // 检查一次 GLFW 是否被要求退出
    {
        // ...
        // 渲染指令
        glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);
        glBindTexture(GL_TEXTURE_2D, texture);
        CHECK_GL(glUseProgram(shaderProgram));
        transform(shaderProgram); // 调用变换函数以传递矩阵
        glBindVertexArray(VAO);
        glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
        // ...
    }
    // ...
}
```

现在，并可以看到一个右下角旋转的图像了。
