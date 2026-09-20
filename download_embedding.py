from modelscope.hub.snapshot_download import snapshot_download
import os

save_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.makedirs(save_directory, exist_ok=True)
model_dir = snapshot_download(
    model_id='sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
    cache_dir=save_directory,
    # 只下载推理必需文件，跳过 onnx 等冗余大文件
    allow_patterns=['*.json', '*.txt', '1_Pooling/*', 'model.safetensors', '*.model']
)
print("模型已下载至：", model_dir)
