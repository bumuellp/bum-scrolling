---
title: llama.cpp & llama-server Cheat Sheet
description: High-density command reference for llama.cpp flags, speculative decoding algorithms, KV cache quantization, and OpenAI-compatible server endpoints.
sidebar:
  label: "llama.cpp Inference"
  order: 70
  badge:
    text: "Cheat Sheet"
    variant: "note"
---

> 🔗 **Related**: [Cheat Sheet: Container Engines](../containers/container-engines-cheatsheet.md) · [Architecture: Container Images (bum-in-a-box)](../architecture/bum-in-a-box-explanation.md) · [Cheat Sheet: Docker & Podman Compose](../containers/compose-cheatsheet.md)

`llama.cpp` and `llama-server` deliver cross-platform LLM inference across hardware backends (Vulkan, CUDA, ROCm, Metal, SYCL, and CPU).

---

## ⚡ Quick Start: High-Throughput Production Server

```bash
llama-server \
  -m /models/Qwen2.5-Coder-32B-Instruct-Q4_K_M.gguf \
  -c 32768 \
  -ngl 99 \
  --flash-attn \
  -ctk q8_0 \
  -ctv q8_0 \
  -np 2 \
  -b 2048 \
  -ub 512 \
  --no-warmup \
  --host 0.0.0.0 \
  --port 8080
```

---

## 📊 Essential CLI Flags Reference

### Performance & Memory Optimization

| Flag              | Long Flag        | Description                                                                               | Values / Examples                    |
| :---------------- | :--------------- | :---------------------------------------------------------------------------------------- | :----------------------------------- |
| **`-fa`**         | `--flash-attn`   | Enables Flash Attention (substantially reduces KV cache VRAM footprint on long contexts). | _Boolean_                            |
| **`--cpu-moe`**   | `--cpu-moe`      | Pins MoE weights to CPU RAM while offloading dense layers to GPU.                         | _Boolean_                            |
| **`-ctk`**        | `--cache-type-k` | KV cache precision for the Key (K) tensor.                                                | `f16` (default), `q8_0`, `q4_0`      |
| **`-ctv`**        | `--cache-type-v` | KV cache precision for the Value (V) tensor.                                              | `f16` (default), `q8_0`, `q4_0`      |
| **`--no-warmup`** | `--no-warmup`    | Skips initial warmup inference pass to speed up startup.                                  | _Boolean_                            |
| **`-c`**          | `--ctx-size`     | Context window size in tokens (0 = model default).                                        | `4096`, `8192`, `32768`              |
| **`-ngl`**        | `--n-gpu-layers` | Number of model layers offloaded to GPU memory.                                           | `99` (all layers) or partial count   |
| **`-t`**          | `--threads`      | Number of CPU compute threads to execute.                                                 | Physical core count (e.g. `8`, `16`) |
| **`-b`**          | `--batch-size`   | Logical prompt processing batch size.                                                     | `512`, `2048`                        |
| **`-ub`**         | `--ubatch-size`  | Physical micro-batch size for GPU compute kernels.                                        | `512`                                |

---

### Speculative Decoding & Multi-Token Prediction (MTP)

| Flag                     | Long Flag            | Description                                                                  | Values / Examples                 |
| :----------------------- | :------------------- | :--------------------------------------------------------------------------- | :-------------------------------- |
| **`-md`**                | `--model-draft`      | Path to draft model file (required for `draft` and separate MTP GGUF files). | `/models/draft.gguf`              |
| **`--spec-type`**        | `--spec-type`        | Speculative decoding algorithm.                                              | `draft`, `draft-mtp`, `ngram-mod` |
| **`--spec-draft-n-max`** | `--spec-draft-n-max` | Maximum draft tokens proposed ahead per step.                                | `3` to `8`                        |
| **`--spec-draft-p-min`** | `--spec-draft-p-min` | Minimum probability cutoff to continue speculative drafting.                 | `0.7` to `0.9` (e.g. `0.8`)       |

#### Speculative Modes (`--spec-type`)

- **`draft` (Requires `-md`)**: Standard speculative decoding using an external, smaller draft model sharing the same tokenizer vocabulary.
- **`draft-mtp`**: Multi-Token Prediction utilizing specialized NextN prediction heads (such as DeepSeek-V3/R1).
  - With auxiliary GGUF file: Pass `-md /path/to/model-mtp.gguf --spec-type draft-mtp`.
  - With pre-merged weights: Supply `--spec-type draft-mtp` without an `-md` argument.
- **`ngram-mod` (Zero Overhead, No `-md`)**: Predicts subsequent tokens by matching n-gram sequences in prompt history. Highly effective for structured JSON, YAML, and boilerplate code editing.

---

## 🧮 Sizing & VRAM Formulas

1. **KV Cache Footprint**:
   $$\text{VRAM}_{\text{KV}} \approx 2 \times N_{\text{layers}} \times N_{\text{kv\_heads}} \times D_{\text{head}} \times N_{\text{ctx}} \times \text{BytesPerPrecision} \times N_{\text{slots}}$$
   - `f16` (2 bytes): Baseline precision.
   - `-ctk q8_0 -ctv q8_0` (1 byte): Cuts KV cache VRAM by 50% with near-zero perplexity impact.
   - `-ctk q4_0 -ctv q4_0` (0.5 bytes): Saves 75% VRAM; enables 32k+ context on consumer GPUs.

2. **Batch Sizing (`-b` vs `-ub`)**:
   - `-b` (Logical Batch): Max tokens scheduled concurrently (e.g., `2048`).
   - `-ub` (Physical Micro-Batch): Tokens evaluated per GPU kernel launch (e.g., `512`). `-b` should be a multiple of `-ub`.

3. **Concurrency Slots (`-np`)**:
   - Each slot allocates a separate KV context pool. Total active tokens scale as $-np \times -c$.

---

## 🚀 Speculative Server Example

```bash
llama-server \
  -m /models/Llama-3.1-70B-Instruct-Q4_K_M.gguf \
  -md /models/Llama-3.2-1B-Instruct-Q4_K_M.gguf \
  --spec-type draft \
  --spec-draft-n-max 8 \
  --spec-draft-p-min 0.8 \
  -c 8192 \
  -ngl 99 \
  --flash-attn \
  --no-warmup \
  --port 8080
```

---

## 🌐 Server HTTP Endpoints (OpenAI Compatible)

| Endpoint                   | Method | Purpose                                                  |
| :------------------------- | :----: | :------------------------------------------------------- |
| **`/v1/chat/completions`** | `POST` | OpenAI-compatible chat completion (streaming supported). |
| **`/v1/completions`**      | `POST` | Raw text prompt completion.                              |
| **`/v1/embeddings`**       | `POST` | Vector embeddings (requires `--embeddings`).             |
| **`/v1/models`**           | `GET`  | List loaded model identifiers.                           |
| **`/health`**              | `GET`  | Healthcheck endpoint (`{"status": "ok"}`).               |
| **`/metrics`**             | `GET`  | Prometheus telemetry (token rates, slot states).         |

---

## 🔗 Related Documentation & Context

- [Cheat Sheet: Container Engines](../containers/container-engines-cheatsheet.md)
- [Architecture: Container Images (bum-in-a-box)](../architecture/bum-in-a-box-explanation.md)
- [Cheat Sheet: Docker & Podman Compose](../containers/compose-cheatsheet.md)
