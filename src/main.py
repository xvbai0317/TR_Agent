from Tools.search_attraction import get_attraction
from Tools.LLM import OpenAICompatibleClient
from Tools.weather import get_weather
import re
from flask import Flask, request, jsonify
from flask_cors import CORS

AGENT_SYSTEM_PROMPT = """
你是一个智能旅行助手。你的任务是分析用户的请求，并使用可用工具一步步地解决问题。

# 可用工具:
- `get_weather(city: str)`: 查询指定城市的实时天气。
- `get_attraction(city: str, weather: str)`: 根据城市和天气搜索推荐的旅游景点。

# 行动格式:
你的回答必须严格遵循以下格式。首先是你的思考过程，然后是你要执行的具体行动，每次回复只输出一对Thought-Action：
Thought: [这里是你的思考过程和下一步计划]
Action: 你决定采取的行动，必须是以下格式之一:
- `function_name(arg_name="arg_value")`:调用一个可用工具。
- `Finish[最终答案]`:当你认为已经获得最终答案时。
- 当你收集到足够的信息，能够回答用户的最终问题时，你必须在Action:字段后使用 Finish[最终答案] 来输出最终答案。

请开始吧！
"""

# 将所有工具函数放入一个字典，方便后续调用
available_tools = {
    "get_weather": get_weather,
    "get_attraction": get_attraction,
}

# --- 1. 配置LLM客户端 ---
# 请根据您使用的服务，将这里替换成对应的凭证和地址
API_KEY = ""
BASE_URL = ""
MODEL_ID = ""

llm = OpenAICompatibleClient(
    model=MODEL_ID,
    api_key=API_KEY,
    base_url=BASE_URL
)

# --- 2. 创建Flask应用 ---
app = Flask(__name__)
CORS(app)  # 允许跨域请求

# --- 3. 定义API路由 ---
@app.route('/api/chat', methods=['POST'])
def chat():
    """处理用户的旅行咨询请求"""
    try:
        data = request.json
        user_prompt = data.get('prompt', '')
        
        if not user_prompt:
            return jsonify({"error": "请提供有效的查询内容"}), 400
        
        # 初始化对话历史
        prompt_history = [f"用户请求: {user_prompt}"]
        conversation = []
        
        # 运行主循环
        for i in range(5):  # 设置最大循环次数
            # 构建Prompt
            full_prompt = "\n".join(prompt_history)
            
            # 调用LLM进行思考
            llm_output = llm.generate(full_prompt, system_prompt=AGENT_SYSTEM_PROMPT)
            # 模型可能会输出多余的Thought-Action，需要截断
            match = re.search(r'(Thought:.*?Action:.*?)(?=\n\s*(?:Thought:|Action:|Observation:)|)', llm_output, re.DOTALL)
            if match:
                truncated = match.group(1).strip()
                if truncated != llm_output.strip():
                    llm_output = truncated
            
            # 记录模型输出
            conversation.append({"role": "assistant", "content": llm_output})
            prompt_history.append(llm_output)
            
            # 解析并执行行动
            action_match = re.search(r"Action: (.*)", llm_output, re.DOTALL)
            if not action_match:
                observation = "错误: 未能解析到 Action 字段。请确保你的回复严格遵循 'Thought: ... Action: ...' 的格式。"
                observation_str = f"Observation: {observation}"
                conversation.append({"role": "system", "content": observation_str})
                prompt_history.append(observation_str)
                continue
            
            action_str = action_match.group(1).strip()

            if action_str.startswith("Finish"):
                final_answer = re.match(r"Finish\[(.*)\]", action_str).group(1)
                conversation.append({"role": "system", "content": f"任务完成，最终答案: {final_answer}"})
                return jsonify({"success": True, "conversation": conversation, "final_answer": final_answer})
            
            # 解析工具调用
            tool_name = re.search(r"(\w+)\(", action_str).group(1)
            args_str = re.search(r"\((.*)\)", action_str).group(1)
            kwargs = dict(re.findall(r'(\w+)="([^"]*)"', args_str))

            # 执行工具调用
            if tool_name in available_tools:
                observation = available_tools[tool_name](**kwargs)
            else:
                observation = f"错误：未定义的工具 '{tool_name}'"

            # 记录观察结果
            observation_str = f"Observation: {observation}"
            conversation.append({"role": "system", "content": observation_str})
            prompt_history.append(observation_str)
        
        # 如果循环结束还没有完成，返回当前状态
        return jsonify({"success": False, "error": "处理超时，请稍后再试", "conversation": conversation}), 500
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """健康检查接口"""
    return jsonify({"status": "ok", "message": "服务运行正常"})

# --- 4. 主函数 ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)