# 摄像机

OpenGL 本身没有摄像机的概念，当运动是相对的，所以我们可以通过把场景中的所有物体往相反方向移动的方式来模拟出摄像机，产生一种摄像机在移动的感觉。

## 定义摄像机

如何定义摄像机？首先我们需要定义摄像机的位置，也就是摄像机在世界坐标系中的位置：

```cpp
glm::vec3 cameraPos = glm::vec3(0.0f, 0.0f, 3.0f);
```

下一个需要的向量是摄像机的方向，现在我们让摄像机指向场景原点：

```cpp
glm::vec3 cameraTarget = glm::vec3(0.0f, 0.0f, 0.0f);
// 指向正 z 轴方向，与摄像机实际指向的方向是正好相反
glm::vec3 cameraDirection = glm::normalize(cameraPos - cameraTarget);
```

得到方向向量后，我们需要再指定一个向上的向量（它是垂直于平面空间，而不是上面的方向向量），为了得到右向量(它代表摄像机空间的 x 轴的正方向)，我们可以把上向量和第二步得到的方向向量进行叉乘，这样会得到指向 x 轴正方向的那个向量：

```cpp
glm::vec3 up = glm::vec3(0.0f, 1.0f, 0.0f); # 人为定义
glm::vec3 cameraRight = glm::normalize(glm::cross(up, cameraDirection));
```

有了 x 轴向量和 z 轴向量，获取一个指向摄像机的正 y 轴向量就相对简单了（我们把右向量和方向向量进行叉乘）：

```cpp
glm::vec3 cameraUp = glm::cross(cameraDirection, cameraRight);
```

> 使用矩阵的好处之一是如果你使用 3 个相互垂直（或非线性）的轴定义了一个坐标空间，你可以用这 3 个轴外加一个平移向量来创建一个矩阵，并且你可以用这个矩阵乘以任何向量来将其变换到那个坐标空间。这正是 LookAt 矩阵所做的。

在 GLM 中提供了对 LookAt 矩阵的支持，对于上面定义的摄像机，我们可以通过指定摄像机位置、目标位置和向上向量来得到一个对应的观察矩阵：

```cpp
glm::mat4 view;
view = glm::lookAt(glm::vec3(0.0f, 0.0f, 3.0f),
           glm::vec3(0.0f, 0.0f, 0.0f),
           glm::vec3(0.0f, 1.0f, 0.0f));
```

## 视角移动

为了让场景变得更加有趣，先在我们的程序前面定义一些摄像机变量：

```cpp
glm::vec3 cameraPos   = glm::vec3(0.0f, 0.0f,  3.0f);
glm::vec3 cameraFront = glm::vec3(0.0f, 0.0f, -1.0f);
glm::vec3 cameraUp    = glm::vec3(0.0f, 1.0f,  0.0f);
```

此时观察矩阵为：

```cpp
view = glm::lookAt(cameraPos, cameraPos + cameraFront, cameraUp);
```

为了能够改变视角，我们需要根据鼠标的输入改变 cameraFront 向量。

欧拉角是可以表示 3D 空间中任何旋转的 3 个值，对于我们的摄像机系统来说，我们只关心俯仰角和偏航角。

我们怎么得到俯仰角和偏航角？偏航角和俯仰角是通过鼠标（或手柄）移动获得的，水平的移动影响偏航角，竖直的移动影响俯仰角。

原理就是，储存上一帧鼠标的位置，在当前帧中我们当前计算鼠标位置与上一帧的位置相差多少。如果水平/竖直差别越大那么俯仰角或偏航角就改变越大，也就是摄像机需要移动更多的距离。

首先我们要告诉 GLFW，它应该隐藏光标，并捕捉它。我们可以用一个简单地配置调用来完成：

```cpp
glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);
```

为了计算俯仰角和偏航角，我们需要让 GLFW 监听鼠标移动事件。（和键盘输入相似）我们会用一个回调函数来完成，函数的原型如下：

```cpp
void mouse_callback(GLFWwindow* window, double xpos, double ypos);
```

当我们用 GLFW 注册了回调函数之后，鼠标一移动 mouse_callback 函数就会被调用：

```cpp
glfwSetCursorPosCallback(window, mouse_callback);
```

在 mouse_callback 函数中，我们需要计算偏航角和俯仰角：

```cpp
bool firstMouse = true;
float lastX = 400, lastY = 300;
float yaw = -90.0f;
float pitch = 0.0f;

void mouse_callback(GLFWwindow* window, double xpos, double ypos)
{
    if(firstMouse)
    {
        lastX = xpos;
        lastY = ypos;
        firstMouse = false;
    }

    float xoffset = xpos - lastX;
    float yoffset = lastY - ypos;
    lastX = xpos;
    lastY = ypos;

    float sensitivity = 0.05;
    xoffset *= sensitivity;
    yoffset *= sensitivity;

    yaw   += xoffset;
    pitch += yoffset;

    if(pitch > 89.0f)
        pitch = 89.0f;
    if(pitch < -89.0f)
        pitch = -89.0f;

    glm::vec3 front;
    front.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
    front.y = sin(glm::radians(pitch));
    front.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));
    cameraFront = glm::normalize(front);
}
```

## 缩放

视野（Field of View）或 fov 定义了我们可以看到场景中多大的范围。当视野变小时，场景投影出来的空间就会减小，产生放大了的感觉。

我们会使用鼠标的滚轮来放大。与鼠标移动、键盘输入一样，我们需要一个鼠标滚轮的回调函数：

```cpp
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset)
{
  if(fov >= 1.0f && fov <= 45.0f)
    fov -= yoffset;
  if(fov <= 1.0f)
    fov = 1.0f;
  if(fov >= 45.0f)
    fov = 45.0f;
}
```

当滚动鼠标滚轮的时候，yoffset 值代表我们竖直滚动的大小。当 scroll_callback 函数被调用后，我们改变全局变量 fov 变量的内容。

因为 45.0f 是默认的视野值，我们将会把缩放级别限制在 1.0f 到 45.0f。

当然，需要先注册鼠标滚轮的回调函数：

```cpp
glfwSetScrollCallback(window, scroll_callback);
```

现在在每一帧都必须把透视投影矩阵上传到 GPU，但现在使用 fov 变量作为它的视野：

```cpp
projection = glm::perspective(glm::radians(fov), 800.0f / 600.0f, 0.1f, 100.0f);
```

现在，我们就实现了一个简单的摄像机系统了，它能够让我们在 3D 环境中自由移动。
