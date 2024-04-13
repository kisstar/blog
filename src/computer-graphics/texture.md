# 纹理

纹理是一个 2D 图片（甚至也有 1D 和 3D 的纹理），它可以用来添加物体的细节；为了能够把纹理映射到三角形上，我们需要指定三角形的每个顶点各自对应纹理的哪个部分。

## 环绕方式

纹理坐标的范围通常是从(0, 0)到(1, 1)，那如果我们把纹理坐标设置在范围之外会发生什么？

OpenGL 默认的行为是重复这个纹理图像（我们基本上忽略浮点纹理坐标的整数部分），但 OpenGL 提供了更多的选择：

| 环绕方式           | 描述                                                                                       |
| :----------------- | :----------------------------------------------------------------------------------------- |
| GL_REPEAT          | 对纹理的默认行为。重复纹理图像。                                                           |
| GL_MIRRORED_REPEAT | 和 GL_REPEAT 一样，但每次重复图片是镜像放置的。                                            |
| GL_CLAMP_TO_EDGE   | 纹理坐标会被约束在 0 到 1 之间，超出的部分会重复纹理坐标的边缘，产生一种边缘被拉伸的效果。 |
| GL_CLAMP_TO_BORDER | 超出的坐标为用户指定的边缘颜色。                                                           |

其中的每个选项都可以使用 glTexParameter\* 函数对单独的一个坐标轴设置。

## 纹理过滤

纹理坐标不依赖于分辨率，它可以是任意浮点值，所以 OpenGL 需要知道怎样将纹理像素映射到纹理坐标。

邻近过滤，是 OpenGL 默认的纹理过滤方式。此时会选择中心点最接近纹理坐标的那个像素。

![filter_nearest](/images/computer-graphics/filter_nearest.png)

线性过滤，会基于纹理坐标附近的纹理像素，计算出一个插值，近似出这些纹理像素之间的颜色。一个纹理像素的中心距离纹理坐标越近，那么这个纹理像素的颜色对最终的样本颜色的贡献越大。

![filter_linear](/images/computer-graphics/filter_linear.png)

当进行放大和缩小操作的时候可以设置纹理过滤的选项，比如你可以在纹理被缩小的时候使用邻近过滤，被放大时使用线性过滤。

## 多级渐远纹理

假设我们有一个包含着上千物体的大房间，每个物体上都有纹理。有些物体会很远，但其纹理会拥有与近处物体同样高的分辨率。

由于远处的物体可能只产生很少的片段，OpenGL 从高分辨率纹理中为这些片段获取正确的颜色值就很困难，因为它需要对一个跨过纹理很大部分的片段只拾取一个纹理颜色。在小物体上这会产生不真实的感觉，并且高分辨率纹理浪费了内存。

OpenGL 使用一种叫做多级渐远纹理（Mipmap）的概念来解决这个问题，它简单来说就是一系列的纹理图像，后一个纹理图像是前一个的二分之一。

距观察者的距离超过一定的阈值，OpenGL 会使用不同的多级渐远纹理，即最适合物体的距离的那个。由于距离远，解析度不高也不会被用户注意到。同时，多级渐远纹理另一加分之处是它的性能非常好。

切换多级渐远纹理级别时你也可以在两个不同多级渐远纹理级别之间使用 NEAREST 和 LINEAR 过滤，避免产生不真实的生硬边界。

| 过滤方式                  | 描述                                                                     |
| :------------------------ | :----------------------------------------------------------------------- |
| GL_NEAREST_MIPMAP_NEAREST | 使用最邻近的多级渐远纹理来匹配像素大小，并使用邻近插值进行纹理采样       |
| GL_LINEAR_MIPMAP_NEAREST  | 使用最邻近的多级渐远纹理级别，并使用线性插值进行采样                     |
| GL_NEAREST_MIPMAP_LINEAR  | 在两个最匹配像素大小的多级渐远纹理之间进行线性插值，使用邻近插值进行采样 |
| GL_LINEAR_MIPMAP_LINEAR   | 在两个邻近的多级渐远纹理之间使用线性插值，并使用线性插值进行采样         |

## 创建纹理

当调用 glTexImage2D 时，当前绑定的纹理对象就会被附加上纹理图像。

```cpp
#include <iostream>
#include <stb_image.h>
#include <glad/glad.h>

int createTexture(const char *filename, bool use_RGBA)
{
    unsigned int texture;
    glGenTextures(1, &texture);
    // 纹理单元 GL_TEXTURE0 默认被激活
    // glActiveTexture(GL_TEXTURE0);
    // 绑定纹理对象（之后任何的纹理指令都可以配置当前绑定的纹理）
    glBindTexture(GL_TEXTURE_2D, texture); // （会绑定这个纹理到当前激活的纹理单元）

    // 设置纹理环绕方式
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_MIRRORED_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_MIRRORED_REPEAT);
    // 设置纹理过滤方式
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    // 多级渐远纹理主要是使用在纹理被缩小的情况下的
    // glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);

    int width, height, nrChannels;
    unsigned char *data = stbi_load(filename, &width, &height, &nrChannels, 0);

    if (data)
    {
        // 生成纹理
        if (use_RGBA)
        {
            glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, data);
        }
        else
        {
            glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data);
        }
        glGenerateMipmap(GL_TEXTURE_2D);
    }
    else
    {
        std::cout << "Failed to load texture" << std::endl;
    }

    // 释放图像的内存
    stbi_image_free(data);

    return texture;
}
```

## 应用纹理

为了能够把纹理映射到三角形上，我们需要指定三角形的每个顶点各自对应纹理的哪个部分。这样每个顶点就会关联着一个纹理坐标，用来标明该从纹理图像的哪个部分采样。之后在图形的其它片段上进行片段插值。

所以，创建好纹理之后，我们需要告知 OpenGL 如何采样纹理，所以我们必须使用纹理坐标更新顶点数据：

```cpp
int createVAO()
{
    float vertices[] = {
        // ---- 位置 ----  ---- 颜色 ----    - 纹理坐标 -
        0.5f, 0.5f, 0.0f, 1.0f, 0.0f, 0.0f, 1.0f, 1.0f,   // 右上
        0.5f, -0.5f, 0.0f, 0.0f, 1.0f, 0.0f, 1.0f, 0.0f,  // 右下
        -0.5f, -0.5f, 0.0f, 0.0f, 0.0f, 1.0f, 0.0f, 0.0f, // 左下
        -0.5f, 0.5f, 0.0f, 1.0f, 1.0f, 0.0f, 0.0f, 1.0f   // 左上
    };
    // ...
    // 告诉 OpenGL 该如何解析顶点数据
    glVertexAttribPointer(0 /* 指定要配置的顶点属性 */,
                          3 /* 顶点属性的大小 */,
                          GL_FLOAT /* 数据的类型 */,
                          GL_FALSE /* 是否标准化 */,
                          8 * sizeof(float) /* 步长 */,
                          (void *)0 /* 位置数据在缓冲中起始位置的偏移量 */);
    // 启用顶点属性
    glEnableVertexAttribArray(0);

    // color attribute
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void *)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);
    // texture coord attribute
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void *)(6 * sizeof(float)));
    glEnableVertexAttribArray(2);
    // ...
    return VAO;
}
```

接着我们需要调整顶点着色器使其能够接受顶点坐标为一个顶点属性，并把坐标传给片段着色器：

```cpp
const std::string vertexString = SHADER_STRING(
    // 设定了输入变量的位置值
    layout(location = 0) in vec3 aPos;
    layout(location = 1) in vec3 aColor;
    layout(location = 2) in vec2 aTexCoord;

    out vec3 ourColor;
    out vec2 TexCoord;

    void main() {
        ourColor = aColor;
        TexCoord = aTexCoord;

        // 为了设置顶点着色器的输出，我们必须把位置数据赋值给预定义的 gl_Position 变量，它在幕后是 vec4 类型的
        // 在真实的程序里输入数据通常都不是标准化设备坐标，所以我们首先必须先把它们转换至 OpenGL 的可视区域内
        gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
    });
```

片段着色器也应该能访问纹理对象，但是我们怎样能把纹理对象传给片段着色器呢？

GLSL 有一个供纹理对象使用的内建数据类型，叫做采样器，它以纹理类型作为后缀，在我们的例子中的 sampler2D。

我们可以简单声明一个 uniform sampler2D 把一个纹理添加到片段着色器中，稍后我们会把纹理赋值给这个 uniform。

```cpp
const std::string fragString = SHADER_STRING(
    // 片段着色器只需要一个输出变量，这个变量是一个 4 分量向量，它表示的是最终的输出颜色
    out vec4 FragColor;

    in vec3 ourColor;
    in vec2 TexCoord;

    uniform sampler2D ourTexture;

    void main() {
        FragColor = texture(ourTexture, TexCoord) * vec4(ourColor, 1.0);
    });
```

我们使用 GLSL 内建的 texture 函数来采样纹理的颜色，该函数会使用之前设置的纹理参数对相应的颜色值进行采样。

## 更新渲染

最后，在调用 glDrawElements 之前绑定纹理就可以了，它会自动把纹理赋值给片段着色器的采样器：

```cpp
// ...
int main()
{
    // ...
    stbi_set_flip_vertically_on_load(true); // 翻转Y轴
    int texture = createTexture("static-resources/container.jpeg", false);

    // 渲染循环
    while (!glfwWindowShouldClose(window)) // 检查一次 GLFW 是否被要求退出
    {
        // ...
        // 渲染指令
        glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);
        glBindTexture(GL_TEXTURE_2D, texture);
        CHECK_GL(glUseProgram(shaderProgram));
        glBindVertexArray(VAO);
        // glDrawArrays(GL_TRIANGLES, 0, 3);
        glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
        // ...
    }
    // ...
}
```

## 纹理单元

在上面的分片着色器中，为什么 sampler2D 变量是个 uniform，我们却不用 glUniform 给它赋值？

实际上，使用 glUniform1i，我们可以给纹理采样器分配一个位置值，这样的话我们能够在一个片段着色器中设置多个纹理。一个纹理的位置值通常称为一个纹理单元。

首先，我们可以按上面同样的方式创建 2 个纹理：

```cpp
int texture1 = createTexture("static-resources/1.jpeg", false);
int texture2 = createTexture("static-resources/2.jpeg", false);
```

然后，我们还需要在渲染前告诉 OpenGL 每个着色器采样器属于哪个纹理单元：

```cpp
glUseProgram(shaderProgram); // 不要忘记在设置uniform变量之前激活着色器程序
glUniform1i(glGetUniformLocation(shaderProgram/* 传入程序的 */, "texture1"), 0);
glUniform1i(glGetUniformLocation(shaderProgram/* 传入程序的 */, "texture2"), 1);

while(...)
{
    // ...
}
```

同时，就像 glBindTexture 一样，在绘制时，我们可以使用 glActiveTexture 激活纹理单元，传入我们需要使用的纹理单元：

_一个纹理的默认纹理单元是 0，它是默认的激活纹理单元，所以教程上面我们没有分配一个位置值。_

```cpp
glActiveTexture(GL_TEXTURE0); // 在绑定纹理之前先激活纹理单元
glBindTexture(GL_TEXTURE_2D, texture1);
glActiveTexture(GL_TEXTURE1);
glBindTexture(GL_TEXTURE_2D, texture2);
```

此后，我们就可以在分片着色器中获取多个纹理：

```cpp
const std::string fragString = SHADER_STRING(
    #version 330 core
    ...

    uniform sampler2D texture1;
    uniform sampler2D texture2;

    void main()
    {
        FragColor = mix(texture(texture1, TexCoord), texture(texture2, TexCoord), 0.2);
    });
```

纹理的介绍就先到这了。
