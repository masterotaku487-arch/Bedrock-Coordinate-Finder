import os
import gradio as gr
from groq import Groq
import tempfile
from gtts import gTTS
import requests

# Inicialização do cliente Groq
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def orchestrator(message, history):
    # Log de Processamento
    log = "🧠 [GENYX ULTRA]: Sincronizando agentes dinâmicos...\n"
    
    # Prepara mensagens para a Groq (Formato de dicionários)
    messages = [{"role": "system", "content": "Você é GENYX ULTRA. Use markdown e blocos ``` para código."}]
    
    # Adiciona histórico no formato correto para a API
    if history:
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})
    
    messages.append({"role": "user", "content": message})
    
    # Inicia Streaming
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        stream=True
    )
    
    # No Gradio novo, o histórico é uma lista de dicionários
    new_history = list(history) if history else []
    new_history.append({"role": "user", "content": message})
    new_history.append({"role": "assistant", "content": ""})

    full_text = ""
    for chunk in response:
        if chunk.choices[0].delta.content:
            full_text += chunk.choices[0].delta.content
            # Atualiza o conteúdo da última mensagem do assistente
            new_history[-1]["content"] = full_text
            yield new_history, log, None, None

    # Gerador de Voz (TTS)
    audio_path = None
    try:
        tts = gTTS(text=full_text[:300], lang='pt')
        t_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        tts.save(t_audio.name)
        audio_path = t_audio.name
    except: pass

    # Gerador de Arquivos/Imagens
    file_path = None
    if "```" in full_text:
        try:
            code_content = full_text.split("```")[1].split("\n", 1)[-1]
            t_file = tempfile.NamedTemporaryFile(delete=False, suffix=".txt", mode="w", encoding="utf-8")
            t_file.write(code_content.strip())
            t_file.close()
            file_path = t_file.name
        except: pass
    elif any(x in message.lower() for x in ["crie", "imagem", "desenhe"]):
        try:
            prompt = message.replace(" ", "%20")
            img_data = requests.get(f"[https://image.pollinations.ai/prompt/](https://image.pollinations.ai/prompt/){prompt}?nologo=true").content
            t_img = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
            t_img.write(img_data)
            t_img.close()
            file_path = t_img.name
        except: pass

    yield new_history, log + "✅ Ciclo Completo.", audio_path, file_path

# --- Interface Gradio Adaptada ---
with gr.Blocks(theme=gr.themes.Monochrome()) as demo:
    gr.Markdown("# 🛰️ GENYX OMNI-ULTRA v8.4")
    
    with gr.Row():
        with gr.Column(scale=3):
            # Deixe o Chatbot sem o parâmetro 'type' para o Gradio decidir o padrão
            chatbot = gr.Chatbot(label="Terminal de Operações", height=500)
            msg = gr.Textbox(placeholder="Comando para a IA Mãe...", show_label=False)
            with gr.Row():
                btn = gr.Button("INSTANCIAR", variant="primary")
                clear = gr.Button("LIMPAR")
            ai_logs = gr.TextArea(label="Logs de Processamento", interactive=False, lines=2)

        with gr.Column(scale=1):
            img_in = gr.Image(label="Upload de Visão", type="numpy")
            audio_out = gr.Audio(label="Link de Voz", autoplay=True)
            file_down = gr.File(label="Arquivo Gerado")

    # Vinculação de Eventos
    btn.click(orchestrator, [msg, chatbot], [chatbot, ai_logs, audio_out, file_down])
    msg.submit(orchestrator, [msg, chatbot], [chatbot, ai_logs, audio_out, file_down])
    clear.click(lambda: ([], "", None, None), None, [chatbot, ai_logs, audio_out, file_down])

if __name__ == "__main__":
    demo.launch()
    