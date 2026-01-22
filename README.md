# TR_Agent - 智能旅行助手

TR_Agent 是一个基于大语言模型的智能旅行助手，能够根据用户的需求，结合天气信息和景点推荐，为用户提供个性化的旅行建议。

## 🌟 功能特性

- **智能对话**：基于 ModelScope 的大语言模型，提供流畅自然的对话体验
- **天气查询**：实时获取指定城市的天气信息
- **景点推荐**：根据城市和天气情况，智能推荐适合的旅游景点
- **思考能力**：启用了模型的思考功能，提供更具逻辑性的回应

## 🚀 快速开始

### 1. 环境要求

- Python 3.10+
- pip 21.0+

### 2. 安装步骤

#### 2.1 克隆仓库

```bash
git clone https://github.com/xvbai0317/TR_Agent.git
cd TR_Agent
```

#### 2.2 创建虚拟环境

```bash
# 使用 pyenv 安装 Python 3.10（如果未安装）
pyenv install 3.10.0
pyenv local 3.10.0

# 创建并激活虚拟环境
python -m venv venv
source venv/bin/activate  # macOS/Linux
# 或 venv\Scripts\activate  # Windows
```

#### 2.3 安装依赖

```bash
pip install colorama python-dotenv requests tavily-python camel-ai
```

### 3. 配置

#### 3.1 设置 ModelScope API Key

在项目根目录创建 `.env` 文件，并添加以下内容：

```env
MODELSCOPE_SDK_TOKEN="your-modelscope-token"
```

> 注意：如果你使用的是 `src/main.py` 中的配置方式，需要在代码中直接修改 `API_KEY` 变量。

### 4. 使用方法

#### 4.1 运行主程序

```bash
# 激活虚拟环境（如果尚未激活）
source venv/bin/activate

# 运行主程序
python src/main.py
```

#### 4.2 示例对话

```
用户输入: 你好，请帮我查询一下今天北京的天气，然后根据天气推荐一个合适的旅游景点。

模型输出:
Thought: 用户需要了解北京的天气并获取景点推荐。我应该先调用get_weather工具查询北京的天气，然后再根据天气情况调用get_attraction工具获取景点推荐。
Action: get_weather(city="北京")

Observation: 北京当前天气:晴，气温5摄氏度

模型输出:
Thought: 已获取到北京的天气信息，现在可以根据天气情况推荐适合的景点。北京今天是晴天，气温5摄氏度，适合室内或有阳光的户外活动。
Action: get_attraction(city="北京", weather="晴，气温5摄氏度")

Observation: 北京晴天且气温5摄氏度时，适合游览以下景点：1. 故宫博物院 - 晴天光影效果好，适合拍照，室内参观不受气温影响；2. 颐和园 - 冬日暖阳下的皇家园林别有韵味；3. 八达岭长城 - 晴天视野开阔，适合户外活动，但需注意保暖。

模型输出:
Thought: 已获取到北京的天气信息和景点推荐，现在可以为用户提供完整的回答。
Action: Finish[北京今天天气晴朗，气温5摄氏度。推荐您游览以下景点：1. 故宫博物院 - 晴天光影效果好，适合拍照，室内参观不受气温影响；2. 颐和园 - 冬日暖阳下的皇家园林别有韵味；3. 八达岭长城 - 晴天视野开阔，适合户外活动，但需注意保暖。]

任务完成，最终答案: 北京今天天气晴朗，气温5摄氏度。推荐您游览以下景点：1. 故宫博物院 - 晴天光影效果好，适合拍照，室内参观不受气温影响；2. 颐和园 - 冬日暖阳下的皇家园林别有韵味；3. 八达岭长城 - 晴天视野开阔，适合户外活动，但需注意保暖。
```

## 📁 项目结构

```
TR_Agent/
├── src/
│   ├── main.py          # 主程序入口
│   ├── Tools/
│   │   ├── LLM.py       # 大语言模型客户端
│   │   ├── weather.py   # 天气查询工具
│   │   └── search_attraction.py  # 景点推荐工具
├── venv/                # 虚拟环境
├── .env                 # 环境变量配置
├── README.md            # 项目说明文档
└── requirements.txt     # 依赖包列表
```

## 🔧 核心模块

### 1. 大语言模型客户端 (LLM.py)

- 基于 OpenAI 兼容接口，连接 ModelScope 的大语言模型
- 支持流式响应和思考功能
- 提供简单的 generate 方法，方便调用模型

### 2. 天气查询工具 (weather.py)

- 使用 wttr.in API 查询实时天气信息
- 支持城市名称作为输入
- 返回格式化的天气描述

### 3. 景点推荐工具 (search_attraction.py)

- 使用 Tavily Search API 搜索景点信息
- 根据城市和天气情况，提供个性化的景点推荐
- 返回详细的景点介绍和推荐理由

## 📝 配置说明

### ModelScope API Key

项目使用 ModelScope 的 API 进行模型调用，需要在 `.env` 文件中设置 `MODELSCOPE_SDK_TOKEN`，或者在代码中直接修改 `API_KEY` 变量。

### 模型配置

默认使用的模型是 `Qwen/Qwen3-8B`，你可以在 `main.py` 中修改 `MODEL_ID` 变量来使用其他模型。

## 🎯 自定义扩展

### 添加新工具

1. 在 `src/Tools/` 目录下创建新的工具文件
2. 在 `main.py` 中导入新工具并添加到 `available_tools` 字典中
3. 在 `AGENT_SYSTEM_PROMPT` 中添加新工具的描述

### 修改系统提示

可以修改 `main.py` 中的 `AGENT_SYSTEM_PROMPT` 变量，调整助手的行为和能力。

## 🌐 API 参考

### 天气查询 API

- **接口**：`https://wttr.in/{city}?format=j1`
- **方法**：GET
- **返回格式**：JSON

### 景点推荐 API

- **接口**：Tavily Search API
- **方法**：POST
- **返回格式**：JSON

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！

## � 待办事项

- [ ] **可视化界面**：开发基于 Web 或桌面的用户友好界面
- [ ] **PDF 生成**：支持将旅行计划导出为 PDF 格式
- [ ] **多语言支持**：添加英文等其他语言的支持
- [ ] **路线规划**：基于景点推荐，自动生成合理的游览路线
- [ ] **交通信息**：整合交通数据，提供更完整的旅行建议
- [ ] **用户偏好学习**：根据用户的历史选择，优化推荐结果
- [ ] **离线功能**：支持离线访问基本功能

## �📄 许可证

本项目采用 MIT 许可证。

## 📞 联系方式

如果有任何问题或建议，欢迎联系我们：

- 邮箱：1773971259@qq.com

---

**享受你的智能旅行助手体验！** ✈️🌍