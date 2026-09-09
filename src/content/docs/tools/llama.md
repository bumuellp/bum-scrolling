---
title: llama.cpp & llama-server Cheat-Sheet
description: Comprehensive reference for llama.cpp flags, speculative decoding, KV cache quantization, and server endpoints.
---

`llama.cpp` and `llama-server` provide cross-platform LLM inference across CPU and GPU hardware backends (CUDA, ROCm, Metal, Vulkan, SYCL, CPU).

---

## 🎛️ Essential CLI Flags Reference

### Performance & Memory Optimization

| Flag               | Long Flag        | Description                                                                             | Values / Examples                          |
| :----------------- | :--------------- | :-------------------------------------------------------------------------------------- | :----------------------------------------- |
| **`--flash-attn`** | `-fa`            | Enables Flash Attention mechanism (greatly reduces VRAM usage for long contexts).       | _Boolean flag_                             |
| **`--cpu-moe`**    | `--cpu-moe`      | Keeps Mixture-of-Experts (MoE) weights on CPU RAM while offloading dense layers to GPU. | _Boolean flag_                             |
| **`-ctk`**         | `--cache-type-k` | KV cache data type for the Key (K) tensor.                                              | `f16` (default), `q8_0`, `q4_0`            |
| **`-ctv`**         | `--cache-type-v` | KV cache data type for the Value (V) tensor.                                            | `f16` (default), `q8_0`, `q4_0`            |
| **`--no-warmup`**  | `--no-warmup`    | Skips initial warmup inference pass on startup to accelerate boot time.                 | _Boolean flag_                             |
| **`-c`**           | `--ctx-size`     | Context window size in tokens (0 = model default).                                      | `4096`, `8192`, `32768`                    |
| **`-ngl`**         | `--n-gpu-layers` | Number of model layers offloaded to GPU memory.                                         | `99` (all layers) or partial split         |
| **`-t`**           | `--threads`      | Number of CPU compute threads to use.                                                   | Physical CPU core count (e.g. `8` or `16`) |
| **`-b`**           | `--batch-size`   | Logical prompt processing batch size.                                                   | `512` or `2048`                            |
| **`-ub`**          | `--ubatch-size`  | Physical micro-batch size for compute kernels.                                          | `512`                                      |

---

### Speculative Decoding & Multi-Token Prediction (MTP)

| Flag                     | Long Flag            | Description                                                                                                               | Values / Examples                 |
| :----------------------- | :------------------- | :------------------------------------------------------------------------------------------------------------------------ | :-------------------------------- |
| **`-md`**                | `--model-draft`      | Path to draft model file (required for `draft`; for `draft-mtp`, required when MTP weights are in an external GGUF file). | `/models/draft-model.gguf`        |
| **`--spec-type`**        | `--spec-type`        | Speculative decoding algorithm / mode.                                                                                    | `draft`, `draft-mtp`, `ngram-mod` |
| **`--spec-draft-n-max`** | `--spec-draft-n-max` | Maximum number of draft tokens predicted ahead per step.                                                                  | `3` to `8`                        |
| **`--spec-draft-p-min`** | `--spec-draft-p-min` | Minimum probability threshold required to continue speculative drafting.                                                  | `0.7` to `0.9` (e.g. `0.8`)       |

#### Speculative Decoding Modes (`--spec-type`)

- **`draft` (Always requires `-md`)**: Classic speculative decoding using an external, smaller standalone draft model (`-md <draft.gguf>`) sharing the same tokenizer vocabulary. The draft model generates token candidates, and the primary model verifies them in parallel in one forward pass.
- **`draft-mtp` (Multi-Token Prediction)**: Accelerates inference using dedicated MTP prediction heads trained to predict multiple tokens ahead.
  - **With Separate MTP File (`-md`)**: When the MTP prediction layers are distributed as a separate auxiliary GGUF file (common in many DeepSeek-V3 / DeepSeek-R1 quantizations), you must explicitly supply it with `-md /path/to/model-mtp.gguf --spec-type draft-mtp`.
  - **With Pre-Merged Weights**: When the primary model GGUF already has the MTP NextN tensors baked directly inside, `--spec-type draft-mtp` works directly without an external `-md`.
- **`ngram-mod` (Zero Overhead, No `-md`)**: Extracts n-gram sequence matches directly from past prompt context to predict subsequent tokens. Requires zero additional weights or files, providing instant acceleration for repetitive code editing, boilerplate, and structured JSON output.

#### Speculative Confidence Filtering (`--spec-draft-p-min`)

- **`--spec-draft-p-min <P>`** sets an acceptance confidence cutoff (e.g., `0.8`). If the drafting head or draft model predicts a token with confidence below `P`, speculative drafting halts immediately for that step. This prevents the model from wasting memory bandwidth and compute verifying low-confidence guesses on novel, creative, or unpredictable text.

---

### Server Concurrency & Context Calculation

| Flag         | Long Flag    | Description                                                            | Values / Examples        |
| :----------- | :----------- | :--------------------------------------------------------------------- | :----------------------- |
| **`-np`**    | `--parallel` | Number of parallel request processing slots (concurrent user streams). | `1`, `2`, `4`            |
| **`--host`** | `--host`     | Network interface address to bind server.                              | `0.0.0.0` or `127.0.0.1` |
| **`--port`** | `--port`     | Listening HTTP port.                                                   | `8080` or `5002`         |
| **`--temp`** | `--temp`     | Sampling temperature.                                                  | `0.0` to `1.0`           |

#### 🧮 How to Calculate Context Integers (`-c`, `-b`, `-ub`, `-np`)

1. **Context Window Size (`-c`)**:
   Choose token integers based on your workload needs:
   - `4096` or `8192`: Standard chat and short code generation.
   - `32768` (32k) or `65536` (64k): Repository-wide code review and large document Q&A.
   - _Rule_: Never exceed the model's native context window unless configuring RoPE scaling (`--rope-freq-scale`).

2. **KV Cache VRAM Footprint**:
   The memory consumed by the KV cache scales with context size, layer count, and precision:
   $$\text{KV Cache (Bytes)} \approx 2 \times N_{\text{layers}} \times N_{\text{kv\_heads}} \times D_{\text{head}} \times N_{\text{ctx}} \times \text{BytesPerPrecision} \times N_{\text{slots}}$$
   - **`f16` (2 bytes)**: Baseline high-precision KV cache.
   - **`-ctk q8_0 -ctv q8_0` (1 byte)**: Halves KV cache VRAM with near-zero perplexity degradation.
   - **`-ctk q4_0 -ctv q4_0` (0.5 bytes)**: 75% VRAM savings; required when running 32k+ contexts on consumer GPUs.

3. **Batch Sizing (`-b` vs `-ub`)**:
   - **Logical Batch (`-b`)**: Max tokens scheduled together (e.g., `2048`). Higher values improve prompt processing throughput during parallel requests.
   - **Physical Micro-Batch (`-ub`)**: Max tokens processed in a single GPU kernel execution (e.g., `512`). `-b` must be a multiple of `-ub`. Lowering `-ub` prevents out-of-memory spikes during prompt ingest.

4. **Slot Concurrency (`-np`)**:
   - Each parallel slot (`-np`) allocates a separate KV context pool. Total context memory allocated by the server is approximately $-np \times -c$. For a server with `-np 4` and `-c 8192`, size your VRAM for 32,768 tokens of active KV cache.

---

## 🚀 Practical Server Examples

### 1. High-Throughput Server with KV Cache Quantization & Flash Attention

```bash
# Saves significant VRAM via q8_0/q4_0 KV cache and Flash Attention
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

### 2. Speculative Decoding with Draft Model

```bash
# Main model verified against faster draft model
llama-server \
  -m /models/Llama-3.1-70B-Instruct-Q4_K_M.gguf \
  -md /models/Llama-3.2-1B-Instruct-Q4_K_M.gguf \
  --spec-type draft \
  --spec-draft-n-max 8 \
  -c 8192 \
  -ngl 99 \
  --flash-attn \
  --no-warmup
```

---

## 🌐 Server HTTP Endpoints (OpenAI Compatible)

| Endpoint                   | Method | Purpose                                                  |
| :------------------------- | :----: | :------------------------------------------------------- |
| **`/v1/chat/completions`** | `POST` | OpenAI-compatible chat completion (streaming supported). |
| **`/v1/completions`**      | `POST` | Raw text prompt completion.                              |
| **`/v1/embeddings`**       | `POST` | Vector embeddings (requires `--embeddings`).             |
| **`/v1/models`**           | `GET`  | List loaded models.                                      |
| **`/health`**              | `GET`  | Healthcheck endpoint (`{"status": "ok"}`).               |
| **`/metrics`**             | `GET`  | Prometheus metrics (token speed, slot allocations).      |
