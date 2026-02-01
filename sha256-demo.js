// ==========================================
// SHA-256 可视化版本 - 暴露中间状态
// ==========================================
class SHA256Visualizer {
    constructor() {
        this.reset();
    }

    reset() {
        // 初始哈希值 H0-H7
        this.H = [
            0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
            0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
        ];
        // 常量 K[0..63]
        this.K = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];
        // 状态追踪
        this.paddedMessage = [];
        this.W = [];
        this.rounds = [];
        this.currentRound = 0;
    }

    // UTF-8 编码
    utf8Encode(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if (c < 128) {
                bytes.push(c);
            } else if (c < 2048) {
                bytes.push((c >> 6) | 192);
                bytes.push((c & 63) | 128);
            } else if (c < 65536) {
                bytes.push((c >> 12) | 224);
                bytes.push(((c >> 6) & 63) | 128);
                bytes.push((c & 63) | 128);
            } else {
                bytes.push((c >> 18) | 240);
                bytes.push(((c >> 12) & 63) | 128);
                bytes.push(((c >> 6) & 63) | 128);
                bytes.push((c & 63) | 128);
            }
        }
        return bytes;
    }

    // 右旋转
    rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }

    // 转十六进制
    toHex(n) {
        return ('00000000' + (n >>> 0).toString(16)).slice(-8);
    }

    // 步骤1: 消息填充
    padMessage(message) {
        const originalBytes = this.utf8Encode(message);
        const bitLength = originalBytes.length * 8;

        // 添加 0x80
        const paddingStart = originalBytes.length;
        const bytes = [...originalBytes];
        bytes.push(0x80);

        // 计算需要填充的零字节数
        const paddingZeros = [];
        while ((bytes.length % 64) !== 56) {
            bytes.push(0);
            paddingZeros.push(0);
        }

        // 添加64位长度（大端序）
        // 注意：JavaScript 位移只支持 32 位，需要分开处理高32位和低32位
        const lengthBytes = [];
        // 高32位（对于短消息总是0）
        const highBits = Math.floor(bitLength / 0x100000000);
        // 低32位
        const lowBits = bitLength >>> 0;
        for (let i = 3; i >= 0; i--) {
            const b = (highBits >>> (i * 8)) & 0xff;
            bytes.push(b);
            lengthBytes.push(b);
        }
        for (let i = 3; i >= 0; i--) {
            const b = (lowBits >>> (i * 8)) & 0xff;
            bytes.push(b);
            lengthBytes.push(b);
        }

        this.paddedMessage = bytes;

        return {
            originalBytes: originalBytes,
            originalText: message,
            paddingByte: 0x80,
            paddingZeros: paddingZeros,
            lengthBytes: lengthBytes,
            bitLength: bitLength,
            finalBlock: bytes.slice(0, 64) // 第一个64字节块
        };
    }

    // 步骤2: 生成消息调度
    generateMessageSchedule(block) {
        const W = new Array(64);
        const computations = [];

        // W[0..15] 直接从消息块提取
        for (let i = 0; i < 16; i++) {
            W[i] = (block[i * 4] << 24) |
                   (block[i * 4 + 1] << 16) |
                   (block[i * 4 + 2] << 8) |
                   (block[i * 4 + 3]);
            computations.push({
                i: i,
                type: 'direct',
                bytes: [block[i * 4], block[i * 4 + 1], block[i * 4 + 2], block[i * 4 + 3]],
                result: W[i]
            });
        }

        // W[16..63] 通过公式计算
        for (let i = 16; i < 64; i++) {
            const w15 = W[i - 15];
            const w2 = W[i - 2];
            const w16 = W[i - 16];
            const w7 = W[i - 7];

            // σ0(x) = ROTR⁷(x) ⊕ ROTR¹⁸(x) ⊕ SHR³(x)
            const rotr7 = this.rightRotate(w15, 7);
            const rotr18 = this.rightRotate(w15, 18);
            const shr3 = w15 >>> 3;
            const sigma0 = rotr7 ^ rotr18 ^ shr3;

            // σ1(x) = ROTR¹⁷(x) ⊕ ROTR¹⁹(x) ⊕ SHR¹⁰(x)
            const rotr17 = this.rightRotate(w2, 17);
            const rotr19 = this.rightRotate(w2, 19);
            const shr10 = w2 >>> 10;
            const sigma1 = rotr17 ^ rotr19 ^ shr10;

            // W[i] = W[i-16] + σ0(W[i-15]) + W[i-7] + σ1(W[i-2])
            W[i] = (w16 + sigma0 + w7 + sigma1) | 0;

            computations.push({
                i: i,
                type: 'computed',
                inputs: {
                    'W[i-16]': { index: i - 16, value: w16 },
                    'W[i-15]': { index: i - 15, value: w15 },
                    'W[i-7]': { index: i - 7, value: w7 },
                    'W[i-2]': { index: i - 2, value: w2 }
                },
                sigma0: {
                    rotr7: rotr7,
                    rotr18: rotr18,
                    shr3: shr3,
                    result: sigma0
                },
                sigma1: {
                    rotr17: rotr17,
                    rotr19: rotr19,
                    shr10: shr10,
                    result: sigma1
                },
                result: W[i]
            });
        }

        this.W = W;
        return { W, computations };
    }

    // 步骤3: 执行单轮压缩
    compressionRound(i, a, b, c, d, e, f, g, h) {
        // Σ1(e) = ROTR⁶(e) ⊕ ROTR¹¹(e) ⊕ ROTR²⁵(e)
        const rotr6 = this.rightRotate(e, 6);
        const rotr11 = this.rightRotate(e, 11);
        const rotr25 = this.rightRotate(e, 25);
        const Sigma1 = rotr6 ^ rotr11 ^ rotr25;

        // Ch(e,f,g) = (e ∧ f) ⊕ (¬e ∧ g)
        const Ch = (e & f) ^ (~e & g);

        // temp1 = h + Σ1(e) + Ch(e,f,g) + K[i] + W[i]
        const temp1 = (h + Sigma1 + Ch + this.K[i] + this.W[i]) | 0;

        // Σ0(a) = ROTR²(a) ⊕ ROTR¹³(a) ⊕ ROTR²²(a)
        const rotr2 = this.rightRotate(a, 2);
        const rotr13 = this.rightRotate(a, 13);
        const rotr22 = this.rightRotate(a, 22);
        const Sigma0 = rotr2 ^ rotr13 ^ rotr22;

        // Maj(a,b,c) = (a ∧ b) ⊕ (a ∧ c) ⊕ (b ∧ c)
        const Maj = (a & b) ^ (a & c) ^ (b & c);

        // temp2 = Σ0(a) + Maj(a,b,c)
        const temp2 = (Sigma0 + Maj) | 0;

        // 新的工作变量
        const newA = (temp1 + temp2) | 0;
        const newE = (d + temp1) | 0;

        return {
            round: i,
            input: { a, b, c, d, e, f, g, h },
            K: this.K[i],
            W: this.W[i],
            Sigma1: {
                rotr6: rotr6,
                rotr11: rotr11,
                rotr25: rotr25,
                result: Sigma1
            },
            Ch: Ch,
            temp1: temp1,
            Sigma0: {
                rotr2: rotr2,
                rotr13: rotr13,
                rotr22: rotr22,
                result: Sigma0
            },
            Maj: Maj,
            temp2: temp2,
            output: {
                a: newA,
                b: a,
                c: b,
                d: c,
                e: newE,
                f: e,
                g: f,
                h: g
            }
        };
    }

    // 计算最终哈希
    computeFinalHash(a, b, c, d, e, f, g, h) {
        const H0 = this.H[0], H1 = this.H[1], H2 = this.H[2], H3 = this.H[3];
        const H4 = this.H[4], H5 = this.H[5], H6 = this.H[6], H7 = this.H[7];

        const finalH = [
            (H0 + a) | 0,
            (H1 + b) | 0,
            (H2 + c) | 0,
            (H3 + d) | 0,
            (H4 + e) | 0,
            (H5 + f) | 0,
            (H6 + g) | 0,
            (H7 + h) | 0
        ];

        return {
            initialH: [H0, H1, H2, H3, H4, H5, H6, H7],
            workingVars: [a, b, c, d, e, f, g, h],
            additions: [
                { H: H0, var: a, result: finalH[0] },
                { H: H1, var: b, result: finalH[1] },
                { H: H2, var: c, result: finalH[2] },
                { H: H3, var: d, result: finalH[3] },
                { H: H4, var: e, result: finalH[4] },
                { H: H5, var: f, result: finalH[5] },
                { H: H6, var: g, result: finalH[6] },
                { H: H7, var: h, result: finalH[7] }
            ],
            finalH: finalH,
            hash: finalH.map(h => this.toHex(h)).join('')
        };
    }

    // 执行完整计算
    compute(message) {
        this.reset();
        const padding = this.padMessage(message);
        const schedule = this.generateMessageSchedule(padding.finalBlock);

        let [a, b, c, d, e, f, g, h] = this.H;
        this.rounds = [];

        // 记录初始状态
        this.rounds.push({
            round: -1,
            output: { a, b, c, d, e, f, g, h }
        });

        for (let i = 0; i < 64; i++) {
            const roundData = this.compressionRound(i, a, b, c, d, e, f, g, h);
            this.rounds.push(roundData);
            ({ a, b, c, d, e, f, g, h } = roundData.output);
        }

        const finalHash = this.computeFinalHash(a, b, c, d, e, f, g, h);

        return {
            padding,
            schedule,
            rounds: this.rounds,
            finalHash
        };
    }
}

// ==========================================
// SHA-256 计算过程演示 UI
// ==========================================
let sha256Visualizer = null;
let currentVisualization = null;
let isPlaying = false;
let playInterval = null;
let currentDisplayRound = 0;
let isAutoPlaying = false;
let autoPlayStep = 0;

function initSHA256Demo() {
    sha256Visualizer = new SHA256Visualizer();

    // 步骤导航
    document.querySelectorAll('.sha256-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentVisualization) return;

            // 用户手动点击时停止自动播放
            stopAutoPlay();

            const step = btn.dataset.step;
            showSHA256Panel(step);
            document.querySelectorAll('.sha256-step-btn').forEach(b => b.classList.remove('active', 'completed'));
            btn.classList.add('active');
            highlightCircuitStage(step);
        });
    });

    // 轮次控制
    const prevBtn = document.getElementById('prev-round');
    const nextBtn = document.getElementById('next-round');
    const playBtn = document.getElementById('play-pause');
    const resetBtn = document.getElementById('reset-rounds');

    if (prevBtn) prevBtn.addEventListener('click', () => goToRound(currentDisplayRound - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToRound(currentDisplayRound + 1));
    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (resetBtn) resetBtn.addEventListener('click', () => goToRound(0));

    // 初始化进度条
    initRoundProgressBar();

    // 计算按钮
    const calcBtn = document.getElementById('sha256-calc-btn');
    if (calcBtn) {
        calcBtn.addEventListener('click', computeAndVisualize);
    }
}

// 初始化轮次进度条
function initRoundProgressBar() {
    const container = document.getElementById('round-progress-container');
    const marksContainer = document.getElementById('round-progress-marks');

    if (!container || !marksContainer) return;

    // 创建64个刻度标记
    marksContainer.innerHTML = '';
    for (let i = 0; i < 64; i++) {
        const mark = document.createElement('div');
        mark.className = 'round-mark';
        // 每16轮添加主要刻度标记
        if (i % 16 === 0) {
            mark.classList.add('major');
            mark.dataset.round = i;
        }
        marksContainer.appendChild(mark);
    }

    // 点击进度条跳转到对应轮次
    container.addEventListener('click', (e) => {
        if (!currentVisualization) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const round = Math.floor(percentage * 64);
        goToRound(Math.min(63, Math.max(0, round)));
    });
}

// 更新轮次进度条
function updateRoundProgressBar(round) {
    const progressBar = document.getElementById('round-progress-bar');
    if (!progressBar) return;

    // 计算进度百分比
    const percentage = ((round + 1) / 64) * 100;
    progressBar.style.width = `${percentage}%`;

    // 根据轮次阶段更新颜色
    progressBar.classList.remove('phase-1', 'phase-2', 'phase-3', 'phase-4');
    if (round < 16) {
        progressBar.classList.add('phase-1');
    } else if (round < 32) {
        progressBar.classList.add('phase-2');
    } else if (round < 48) {
        progressBar.classList.add('phase-3');
    } else {
        progressBar.classList.add('phase-4');
    }
}

// 高亮电路图中的对应阶段（不滚动）
function highlightCircuitStage(step) {
    // 移除所有高亮
    document.querySelectorAll('.circuit-stage').forEach(stage => {
        stage.classList.remove('active-stage');
    });
    document.querySelectorAll('.stage-box').forEach(box => {
        box.classList.remove('active-box');
    });

    // 根据步骤高亮对应的电路图阶段
    const stage = document.querySelector(`.circuit-stage[data-step="${step}"]`);
    if (stage) {
        stage.classList.add('active-stage');
        const box = stage.querySelector('.stage-box');
        if (box) box.classList.add('active-box');
    }
}

// 动画显示步骤
function animateToStep(step, callback) {
    const steps = ['padding', 'schedule', 'compress', 'final'];
    const stepIndex = steps.indexOf(step);

    // 更新按钮状态
    document.querySelectorAll('.sha256-step-btn').forEach((btn, i) => {
        btn.classList.remove('active', 'completed');
        if (i < stepIndex) btn.classList.add('completed');
        if (i === stepIndex) btn.classList.add('active');
    });

    // 高亮电路图
    highlightCircuitStage(step);

    // 显示面板（带动画）
    showSHA256Panel(step, true);

    if (callback) {
        setTimeout(callback, 100);
    }
}

function computeAndVisualize() {
    const input = document.getElementById('sha256-input').value;
    if (!sha256Visualizer) {
        sha256Visualizer = new SHA256Visualizer();
    }
    currentVisualization = sha256Visualizer.compute(input);
    currentDisplayRound = 0;

    // 显示演示区域（带动画）
    const demoSection = document.getElementById('sha256-process-demo');
    if (demoSection) {
        demoSection.style.display = 'block';
        demoSection.classList.remove('fade-in');
        // 触发重绘以重新播放动画
        void demoSection.offsetWidth;
        demoSection.classList.add('fade-in');

        // 滚动到演示区域（只在开始时滚动一次）
        setTimeout(() => {
            demoSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    // 开始自动播放步骤动画
    autoPlayStep = 0;
    startAutoPlaySteps();
}

// 自动播放各步骤
let autoPlayTimeoutId = null;
let roundAutoPlayInterval = null;

function startAutoPlaySteps() {
    const steps = ['padding', 'schedule', 'compress', 'final'];
    const stepDurations = [2000, 2500, 0, 2000]; // compress 步骤时间由轮次播放控制
    isAutoPlaying = true;

    function playNextStep() {
        if (!isAutoPlaying || autoPlayStep >= steps.length) {
            isAutoPlaying = false;
            return;
        }

        const step = steps[autoPlayStep];
        const duration = stepDurations[autoPlayStep];

        animateToStep(step, () => {
            // 如果是压缩步骤，自动播放64轮
            if (step === 'compress') {
                startRoundAutoPlay(() => {
                    // 64轮播放完成后，进入下一步
                    autoPlayStep++;
                    if (isAutoPlaying && autoPlayStep < steps.length) {
                        autoPlayTimeoutId = setTimeout(playNextStep, 500);
                    } else {
                        isAutoPlaying = false;
                    }
                });
            } else {
                autoPlayStep++;
                // 每个步骤停留一段时间后进入下一步
                if (isAutoPlaying && autoPlayStep < steps.length) {
                    autoPlayTimeoutId = setTimeout(playNextStep, duration);
                } else {
                    isAutoPlaying = false;
                }
            }
        });
    }

    playNextStep();
}

// 自动播放64轮压缩过程
function startRoundAutoPlay(onComplete) {
    if (!currentVisualization) return;

    currentDisplayRound = 0;
    goToRound(0);

    const roundDelay = 400; // 每轮停留400ms，用户可以观察变化

    roundAutoPlayInterval = setInterval(() => {
        if (!isAutoPlaying) {
            clearInterval(roundAutoPlayInterval);
            roundAutoPlayInterval = null;
            return;
        }

        currentDisplayRound++;

        if (currentDisplayRound >= 64) {
            clearInterval(roundAutoPlayInterval);
            roundAutoPlayInterval = null;
            // 在最后一轮停留一会儿再继续
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 800);
            return;
        }

        goToRound(currentDisplayRound);
    }, roundDelay);
}

function stopAutoPlay() {
    isAutoPlaying = false;
    autoPlayStep = 0;
    if (autoPlayTimeoutId) {
        clearTimeout(autoPlayTimeoutId);
        autoPlayTimeoutId = null;
    }
    if (roundAutoPlayInterval) {
        clearInterval(roundAutoPlayInterval);
        roundAutoPlayInterval = null;
    }
    // 同时停止手动播放
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
    }
    isPlaying = false;
    const btn = document.getElementById('play-pause');
    if (btn) btn.textContent = '▶';
}

function showSHA256Panel(step, animate = false) {
    if (!currentVisualization) return;

    // 隐藏所有面板
    document.querySelectorAll('.sha256-panel').forEach(p => {
        p.style.display = 'none';
        p.classList.remove('panel-animate-in');
    });

    // 显示对应面板
    const panel = document.getElementById(`${step}-panel`);
    if (panel) {
        panel.style.display = 'block';

        if (animate) {
            panel.classList.add('panel-animate-in');
        }

        switch(step) {
            case 'padding':
                renderPaddingPanel(animate);
                break;
            case 'schedule':
                renderSchedulePanel(animate);
                break;
            case 'compress':
                renderCompressPanel();
                break;
            case 'final':
                renderFinalPanel(animate);
                break;
        }
    }
}

function renderPaddingPanel(animate = false) {
    const container = document.getElementById('padding-visual');
    if (!container || !currentVisualization) return;

    const { padding } = currentVisualization;
    container.innerHTML = '';

    const allCells = [];

    // 原始字节
    padding.originalBytes.forEach((b, i) => {
        const char = padding.originalText[i] || '';
        const displayChar = b >= 32 && b < 127 ? char : '';
        allCells.push({ type: 'original', value: b.toString(16).padStart(2, '0').toUpperCase(), title: displayChar });
    });

    // 0x80 填充位
    allCells.push({ type: 'padding-start', value: '80', title: '' });

    // 零填充
    padding.paddingZeros.forEach(() => {
        allCells.push({ type: 'padding', value: '00', title: '' });
    });

    // 长度字节
    padding.lengthBytes.forEach(b => {
        allCells.push({ type: 'length', value: b.toString(16).padStart(2, '0').toUpperCase(), title: '' });
    });

    // 添加所有单元格（带动画延迟）
    allCells.forEach((cell, i) => {
        const div = document.createElement('div');
        div.className = `byte-cell ${cell.type}`;
        div.title = cell.title;
        div.textContent = cell.value;

        if (animate) {
            div.style.opacity = '0';
            div.style.transform = 'scale(0.8)';
            setTimeout(() => {
                div.style.transition = 'all 0.2s ease';
                div.style.opacity = '1';
                div.style.transform = 'scale(1)';
            }, i * 15);
        }

        container.appendChild(div);
    });

    // 更新图例信息
    const legend = document.getElementById('padding-legend');
    if (legend) {
        legend.innerHTML = `
            <div class="padding-info">
                <span class="legend-item"><span class="legend-color original"></span> ${t('sha256.padding.original')} (${padding.originalBytes.length} ${t('sha256.bytes')})</span>
                <span class="legend-item"><span class="legend-color padding-start"></span> ${t('sha256.padding.pad')} (0x80 + ${padding.paddingZeros.length} ${t('sha256.zeros')})</span>
                <span class="legend-item"><span class="legend-color length"></span> ${t('sha256.padding.length')} (${padding.bitLength} ${t('sha256.bits')})</span>
            </div>
            <div class="padding-total">${t('sha256.total')}: 64 ${t('sha256.bytes')} (512 ${t('sha256.bits')})</div>
        `;
    }
}

function renderSchedulePanel(animate = false) {
    const container = document.getElementById('w-array');
    if (!container || !currentVisualization) return;

    const { schedule } = currentVisualization;
    container.innerHTML = '';

    schedule.W.forEach((w, i) => {
        const isComputed = i >= 16;
        const cell = document.createElement('div');
        cell.className = `w-cell ${isComputed ? 'computed' : 'direct'}`;
        cell.dataset.index = i;
        cell.title = `W[${i}]`;
        cell.innerHTML = `
            <div class="w-index">W[${i}]</div>
            <div class="w-value">${sha256Visualizer.toHex(w)}</div>
        `;

        if (animate) {
            cell.style.opacity = '0';
            cell.style.transform = 'translateY(10px)';
            setTimeout(() => {
                cell.style.transition = 'all 0.15s ease';
                cell.style.opacity = '1';
                cell.style.transform = 'translateY(0)';
            }, i * 20);
        }

        // 点击事件
        cell.addEventListener('click', () => {
            showWComputation(i);
            container.querySelectorAll('.w-cell').forEach(c => c.classList.remove('highlight'));
            cell.classList.add('highlight');
        });

        container.appendChild(cell);
    });
}

function showWComputation(index) {
    const detail = document.getElementById('w-computation');
    if (!detail || !currentVisualization) return;

    const computation = currentVisualization.schedule.computations[index];

    if (computation.type === 'direct') {
        detail.innerHTML = `
            <div class="w-detail-title">W[${index}] - ${t('sha256.w.direct')}</div>
            <div class="w-detail-content">
                <div class="w-formula">${t('sha256.w.from.bytes')}: [${computation.bytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}]</div>
                <div class="w-result">= ${sha256Visualizer.toHex(computation.result)}</div>
            </div>
        `;
    } else {
        const inputs = computation.inputs;
        detail.innerHTML = `
            <div class="w-detail-title">W[${index}] - ${t('sha256.w.computed')}</div>
            <div class="w-detail-content">
                <div class="w-formula-section">
                    <div class="formula-label">σ0(W[${inputs['W[i-15]'].index}]):</div>
                    <div class="formula-detail">
                        ROTR⁷ ⊕ ROTR¹⁸ ⊕ SHR³<br>
                        = ${sha256Visualizer.toHex(computation.sigma0.result)}
                    </div>
                </div>
                <div class="w-formula-section">
                    <div class="formula-label">σ1(W[${inputs['W[i-2]'].index}]):</div>
                    <div class="formula-detail">
                        ROTR¹⁷ ⊕ ROTR¹⁹ ⊕ SHR¹⁰<br>
                        = ${sha256Visualizer.toHex(computation.sigma1.result)}
                    </div>
                </div>
                <div class="w-formula-section">
                    <div class="formula-label">${t('sha256.w.formula')}:</div>
                    <div class="formula-detail">
                        W[${inputs['W[i-16]'].index}] + σ0 + W[${inputs['W[i-7]'].index}] + σ1<br>
                        = ${sha256Visualizer.toHex(inputs['W[i-16]'].value)} + ${sha256Visualizer.toHex(computation.sigma0.result)} + ${sha256Visualizer.toHex(inputs['W[i-7]'].value)} + ${sha256Visualizer.toHex(computation.sigma1.result)}<br>
                        = <strong>${sha256Visualizer.toHex(computation.result)}</strong>
                    </div>
                </div>
            </div>
        `;

        // 高亮依赖的W元素
        const container = document.getElementById('w-array');
        if (container) {
            container.querySelectorAll('.w-cell').forEach(c => c.classList.remove('dependency'));
            [inputs['W[i-16]'].index, inputs['W[i-15]'].index, inputs['W[i-7]'].index, inputs['W[i-2]'].index].forEach(idx => {
                const cell = container.querySelector(`[data-index="${idx}"]`);
                if (cell) cell.classList.add('dependency');
            });
        }
    }
}

function renderCompressPanel() {
    if (!currentVisualization) return;
    goToRound(currentDisplayRound);
}

function goToRound(round) {
    if (!currentVisualization) return;

    round = Math.max(0, Math.min(63, round));
    currentDisplayRound = round;

    // 更新轮次标签
    const roundLabel = document.getElementById('current-round');
    if (roundLabel) roundLabel.textContent = round;

    // 更新进度条
    updateRoundProgressBar(round);

    // 获取当前轮和前一轮的数据
    const roundData = currentVisualization.rounds[round + 1]; // +1 因为 rounds[0] 是初始状态
    const prevData = currentVisualization.rounds[round];

    if (!roundData) return;

    // 渲染工作变量
    renderWorkingVars(roundData, prevData);

    // 渲染运算过程
    renderRoundOperations(roundData);
}

function renderWorkingVars(roundData, prevData) {
    const container = document.getElementById('working-vars');
    if (!container) return;

    const vars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    // 检查是否已有元素，如果有则更新而不是重建
    const existingBoxes = container.querySelectorAll('.var-box');

    if (existingBoxes.length === 8) {
        // 更新现有元素
        vars.forEach((v, i) => {
            const current = roundData.output[v];
            const prev = prevData ? prevData.output[v] : roundData.input[v];
            const changed = current !== prev;
            const box = existingBoxes[i];
            const valueEl = box.querySelector('.var-value');

            if (changed) {
                box.classList.remove('changed');
                void box.offsetWidth; // 触发重绘
                box.classList.add('changed');
                valueEl.textContent = sha256Visualizer.toHex(current);
            } else {
                box.classList.remove('changed');
                valueEl.textContent = sha256Visualizer.toHex(current);
            }
        });
    } else {
        // 首次渲染
        let html = '';
        vars.forEach(v => {
            const current = roundData.output[v];
            const prev = prevData ? prevData.output[v] : roundData.input[v];
            const changed = current !== prev;

            html += `
                <div class="var-box ${changed ? 'changed' : ''}">
                    <div class="var-name">${v}</div>
                    <div class="var-value">${sha256Visualizer.toHex(current)}</div>
                </div>
            `;
        });
        container.innerHTML = html;
    }
}

function renderRoundOperations(roundData) {
    const container = document.getElementById('round-ops');
    if (!container) return;

    const ops = [
        { name: 'Σ1(e)', formula: 'ROTR⁶(e) ⊕ ROTR¹¹(e) ⊕ ROTR²⁵(e)', result: roundData.Sigma1.result },
        { name: 'Ch(e,f,g)', formula: '(e ∧ f) ⊕ (¬e ∧ g)', result: roundData.Ch },
        { name: 'temp1', formula: 'h + Σ1 + Ch + K[i] + W[i]', result: roundData.temp1 },
        { name: 'Σ0(a)', formula: 'ROTR²(a) ⊕ ROTR¹³(a) ⊕ ROTR²²(a)', result: roundData.Sigma0.result },
        { name: 'Maj(a,b,c)', formula: '(a ∧ b) ⊕ (a ∧ c) ⊕ (b ∧ c)', result: roundData.Maj },
        { name: 'temp2', formula: 'Σ0 + Maj', result: roundData.temp2 }
    ];

    let html = `
        <div class="round-info">
            <span class="round-label">K[${roundData.round}] = ${sha256Visualizer.toHex(roundData.K)}</span>
            <span class="round-label">W[${roundData.round}] = ${sha256Visualizer.toHex(roundData.W)}</span>
        </div>
        <div class="ops-list">
    `;

    ops.forEach(op => {
        html += `
            <div class="op-line">
                <span class="op-name">${op.name}</span>
                <span class="op-formula">${op.formula}</span>
                <span class="op-result">${sha256Visualizer.toHex(op.result)}</span>
            </div>
        `;
    });

    html += `
        </div>
        <div class="round-update">
            <div class="update-title">${t('sha256.var.update')}:</div>
            <div class="update-detail">
                a ← temp1 + temp2 = ${sha256Visualizer.toHex(roundData.output.a)}<br>
                e ← d + temp1 = ${sha256Visualizer.toHex(roundData.output.e)}<br>
                ${t('sha256.shift.others')}
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function togglePlay() {
    const btn = document.getElementById('play-pause');
    if (isPlaying) {
        // 停止播放
        isPlaying = false;
        if (playInterval) {
            clearInterval(playInterval);
            playInterval = null;
        }
        if (btn) btn.textContent = '▶';
    } else {
        // 开始播放
        isPlaying = true;
        if (btn) btn.textContent = '⏸';
        playInterval = setInterval(() => {
            if (currentDisplayRound >= 63) {
                // 播放完毕，停止
                isPlaying = false;
                if (playInterval) {
                    clearInterval(playInterval);
                    playInterval = null;
                }
                if (btn) btn.textContent = '▶';
                return;
            }
            goToRound(currentDisplayRound + 1);
        }, 400); // 与自动播放保持一致的速度
    }
}

function renderFinalPanel(animate = false) {
    const container = document.getElementById('final-panel');
    if (!container || !currentVisualization) return;

    const { finalHash } = currentVisualization;

    // 渲染加法过程
    const addContainer = document.getElementById('final-add');
    if (addContainer) {
        const varNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        addContainer.innerHTML = '<div class="final-additions" id="final-additions-list"></div>';
        const listContainer = document.getElementById('final-additions-list');

        finalHash.additions.forEach((add, i) => {
            const row = document.createElement('div');
            row.className = 'final-add-row';
            row.innerHTML = `
                <span class="add-label">H${i}</span>
                <span class="add-value">${sha256Visualizer.toHex(add.H)}</span>
                <span class="add-op">+</span>
                <span class="add-label">${varNames[i]}</span>
                <span class="add-value">${sha256Visualizer.toHex(add.var)}</span>
                <span class="add-op">=</span>
                <span class="add-result">${sha256Visualizer.toHex(add.result)}</span>
            `;

            if (animate) {
                row.style.opacity = '0';
                row.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    row.style.transition = 'all 0.3s ease';
                    row.style.opacity = '1';
                    row.style.transform = 'translateX(0)';
                }, i * 100);
            }

            listContainer.appendChild(row);
        });
    }

    // 渲染最终哈希
    const hashContainer = document.getElementById('final-hash-result');
    if (hashContainer) {
        hashContainer.innerHTML = `
            <div class="final-hash-value ${animate ? 'hash-reveal' : ''}">${finalHash.hash}</div>
            <div class="final-hash-parts">
                ${finalHash.finalH.map((h, i) => `<span class="hash-part" style="${animate ? `animation-delay: ${0.8 + i * 0.1}s` : ''}">${sha256Visualizer.toHex(h)}</span>`).join('')}
            </div>
        `;
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initSHA256Demo);
