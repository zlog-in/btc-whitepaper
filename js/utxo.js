// ==========================================
// UTXO 数据结构
// ==========================================
let utxos = [];
let selectedUtxos = [];
let txHistory = [];
let txCounter = 0;

const FEE = 0.0001; // 固定手续费

// 生成随机交易 ID
function randomTxId() {
    let result = '';
    const chars = '0123456789abcdef';
    for (let i = 0; i < 64; i++) {
        result += chars[Math.floor(Math.random() * 16)];
    }
    return result;
}

// 生成随机地址
function randomAddress() {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '1';
    for (let i = 0; i < 33; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

// 截断显示
function truncate(str, len = 8) {
    if (str.length <= len * 2) return str;
    return str.substring(0, len) + '...' + str.substring(str.length - len);
}

// ==========================================
// UI 更新函数
// ==========================================
function updateBalance() {
    const total = utxos.reduce((sum, utxo) => sum + utxo.amount, 0);
    document.getElementById('wallet-balance').textContent = total.toFixed(4) + ' BTC';
}

function renderUtxoList() {
    const list = document.getElementById('utxo-list');
    list.innerHTML = '';

    if (utxos.length === 0) {
        list.innerHTML = `<p class="empty-hint" data-i18n="utxo.empty">${typeof t === 'function' ? t('utxo.empty') : '暂无 UTXO，点击"模拟收款"添加'}</p>`;
        return;
    }

    utxos.forEach((utxo, index) => {
        const isSelected = selectedUtxos.includes(index);
        const div = document.createElement('div');
        div.className = `utxo-item ${isSelected ? 'selected' : ''}`;
        div.innerHTML = `
            <div class="utxo-amount">${utxo.amount.toFixed(4)} BTC</div>
            <div class="utxo-details">
                <div class="utxo-txid">TX: ${truncate(utxo.txid)}</div>
                <div class="utxo-vout">Output #${utxo.vout}</div>
            </div>
            <div class="utxo-status ${isSelected ? 'selected' : 'unspent'}">${isSelected ? '✓ 已选' : '○ 可用'}</div>
        `;
        div.addEventListener('click', () => toggleUtxoSelection(index));
        list.appendChild(div);
    });

    updateBalance();
}

function toggleUtxoSelection(index) {
    const idx = selectedUtxos.indexOf(index);
    if (idx === -1) {
        selectedUtxos.push(index);
    } else {
        selectedUtxos.splice(idx, 1);
    }
    renderUtxoList();
    updateTxInputs();
    updateTxPreview();
}

function updateTxInputs() {
    const container = document.getElementById('tx-inputs');

    if (selectedUtxos.length === 0) {
        container.innerHTML = `<p class="empty-hint" data-i18n="utxo.tx.select">${typeof t === 'function' ? t('utxo.tx.select') : '点击上方的 UTXO 来选择作为输入'}</p>`;
        document.getElementById('input-total').textContent = '0 BTC';
        return;
    }

    let html = '';
    let total = 0;
    selectedUtxos.forEach(index => {
        const utxo = utxos[index];
        total += utxo.amount;
        html += `
            <div class="tx-input-item">
                <span class="input-amount">${utxo.amount.toFixed(4)} BTC</span>
                <span class="input-txid">${truncate(utxo.txid, 6)}</span>
            </div>
        `;
    });

    container.innerHTML = html;
    document.getElementById('input-total').textContent = total.toFixed(4) + ' BTC';
}

function updateTxPreview() {
    const sendAmount = parseFloat(document.getElementById('send-amount').value) || 0;
    const inputTotal = selectedUtxos.reduce((sum, idx) => sum + utxos[idx].amount, 0);
    const change = inputTotal - sendAmount - FEE;

    document.getElementById('summary-send').textContent = sendAmount.toFixed(4) + ' BTC';
    document.getElementById('summary-change').textContent = Math.max(0, change).toFixed(4) + ' BTC';
    document.getElementById('summary-fee').textContent = FEE.toFixed(4) + ' BTC';

    // 更新输出预览
    const preview = document.getElementById('tx-outputs-preview');
    const recipient = document.getElementById('recipient-address').value || '...';

    if (sendAmount > 0) {
        let html = `
            <div class="output-preview-item">
                <span class="output-label" data-i18n="utxo.tx.to">${typeof t === 'function' ? t('utxo.tx.to') : '发送给'}:</span>
                <span class="output-address">${truncate(recipient, 8)}</span>
                <span class="output-amount">${sendAmount.toFixed(4)} BTC</span>
            </div>
        `;
        if (change > 0) {
            html += `
                <div class="output-preview-item change">
                    <span class="output-label" data-i18n="utxo.tx.change.back">${typeof t === 'function' ? t('utxo.tx.change.back') : '找零'}:</span>
                    <span class="output-address">${typeof t === 'function' ? t('utxo.tx.my.address') : '我的地址'}</span>
                    <span class="output-amount">${change.toFixed(4)} BTC</span>
                </div>
            `;
        }
        preview.innerHTML = html;
    } else {
        preview.innerHTML = '';
    }

    // 启用/禁用发送按钮
    const sendBtn = document.getElementById('send-tx');
    const canSend = selectedUtxos.length > 0 && sendAmount > 0 && change >= 0 && recipient.length > 10;
    sendBtn.disabled = !canSend;
}

// ==========================================
// 交易动画
// ==========================================
async function animateTransaction(inputs, outputs) {
    const resultDiv = document.getElementById('tx-result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div class="tx-animation">
            <div class="tx-anim-inputs" id="anim-inputs"></div>
            <div class="tx-anim-center">
                <div class="tx-anim-arrow">→</div>
                <div class="tx-anim-box" id="tx-box">TX</div>
                <div class="tx-anim-arrow">→</div>
            </div>
            <div class="tx-anim-outputs" id="anim-outputs"></div>
        </div>
    `;

    const animInputs = document.getElementById('anim-inputs');
    const animOutputs = document.getElementById('anim-outputs');
    const txBox = document.getElementById('tx-box');

    // 显示输入
    for (const input of inputs) {
        await sleep(200);
        const div = document.createElement('div');
        div.className = 'anim-utxo input';
        div.innerHTML = `<span class="anim-amount">${input.amount.toFixed(4)} BTC</span>`;
        animInputs.appendChild(div);
        await sleep(100);
        div.classList.add('consuming');
    }

    // 交易处理动画
    await sleep(300);
    txBox.classList.add('processing');
    await sleep(500);
    txBox.classList.remove('processing');
    txBox.classList.add('done');

    // 显示输出
    for (const output of outputs) {
        await sleep(200);
        const div = document.createElement('div');
        div.className = `anim-utxo output ${output.isChange ? 'change' : ''}`;
        div.innerHTML = `
            <span class="anim-amount">${output.amount.toFixed(4)} BTC</span>
            <span class="anim-label">${output.isChange ? (typeof t === 'function' ? t('utxo.tx.change') : '找零') : (typeof t === 'function' ? t('utxo.tx.sent') : '已发送')}</span>
        `;
        animOutputs.appendChild(div);
        await sleep(100);
        div.classList.add('created');
    }

    // 显示手续费
    await sleep(300);
    const feeDiv = document.createElement('div');
    feeDiv.className = 'tx-fee-display';
    feeDiv.innerHTML = `⛏️ ${typeof t === 'function' ? t('utxo.tx.fee') : '手续费'}: ${FEE.toFixed(4)} BTC`;
    resultDiv.querySelector('.tx-animation').appendChild(feeDiv);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// UTXO 链追溯
// ==========================================
function renderUtxoChain() {
    const container = document.getElementById('utxo-chain');

    if (txHistory.length === 0) {
        container.innerHTML = `<p class="empty-hint" data-i18n="utxo.chain.empty">${typeof t === 'function' ? t('utxo.chain.empty') : '暂无交易历史'}</p>`;
        return;
    }

    let html = '<div class="chain-flow">';
    txHistory.forEach((tx, idx) => {
        if (idx > 0) {
            html += '<div class="chain-connector">→</div>';
        }
        html += `
            <div class="chain-tx">
                <div class="chain-tx-header">TX #${idx + 1}</div>
                <div class="chain-tx-body">
                    <div class="chain-inputs">
                        ${tx.inputs.map(i => `<div class="chain-utxo consumed">${i.amount.toFixed(4)}</div>`).join('')}
                    </div>
                    <div class="chain-arrow">→</div>
                    <div class="chain-outputs">
                        ${tx.outputs.map(o => `<div class="chain-utxo ${o.isChange ? 'change' : 'sent'}">${o.amount.toFixed(4)}</div>`).join('')}
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function generateSampleChain() {
    // 生成示例交易链
    txHistory = [];

    // 模拟一些交易
    const sampleTxs = [
        {
            inputs: [{ txid: randomTxId(), vout: 0, amount: 1.0 }],
            outputs: [
                { address: randomAddress(), amount: 0.6, isChange: false },
                { address: randomAddress(), amount: 0.39, isChange: true }
            ]
        },
        {
            inputs: [{ txid: randomTxId(), vout: 1, amount: 0.39 }],
            outputs: [
                { address: randomAddress(), amount: 0.2, isChange: false },
                { address: randomAddress(), amount: 0.18, isChange: true }
            ]
        },
        {
            inputs: [{ txid: randomTxId(), vout: 0, amount: 0.5 }, { txid: randomTxId(), vout: 1, amount: 0.18 }],
            outputs: [
                { address: randomAddress(), amount: 0.65, isChange: false },
                { address: randomAddress(), amount: 0.02, isChange: true }
            ]
        }
    ];

    txHistory = sampleTxs;
    renderUtxoChain();
}

// ==========================================
// 事件监听器
// ==========================================
document.getElementById('add-utxo').addEventListener('click', () => {
    // 添加随机 UTXO
    const amount = Math.round((Math.random() * 0.9 + 0.1) * 10000) / 10000;
    utxos.push({
        txid: randomTxId(),
        vout: Math.floor(Math.random() * 3),
        amount: amount
    });
    renderUtxoList();
});

document.getElementById('send-amount').addEventListener('input', updateTxPreview);
document.getElementById('recipient-address').addEventListener('input', updateTxPreview);

document.getElementById('send-tx').addEventListener('click', async () => {
    const sendAmount = parseFloat(document.getElementById('send-amount').value);
    const recipient = document.getElementById('recipient-address').value;
    const inputTotal = selectedUtxos.reduce((sum, idx) => sum + utxos[idx].amount, 0);
    const change = inputTotal - sendAmount - FEE;

    // 获取选中的 UTXOs
    const inputs = selectedUtxos.map(idx => utxos[idx]);

    // 创建输出
    const outputs = [
        { address: recipient, amount: sendAmount, isChange: false }
    ];
    if (change > 0.00001) {
        outputs.push({ address: document.getElementById('wallet-address').textContent, amount: change, isChange: true });
    }

    // 记录交易历史
    txCounter++;
    txHistory.push({ inputs: [...inputs], outputs: [...outputs] });

    // 播放动画
    await animateTransaction(inputs, outputs);

    // 更新 UTXO 列表
    // 移除已花费的 UTXO（从后往前删除以保持索引正确）
    selectedUtxos.sort((a, b) => b - a).forEach(idx => {
        utxos.splice(idx, 1);
    });

    // 添加找零作为新的 UTXO
    if (change > 0.00001) {
        utxos.push({
            txid: randomTxId(),
            vout: 1,
            amount: change
        });
    }

    // 重置选择
    selectedUtxos = [];

    // 更新 UI
    renderUtxoList();
    updateTxInputs();
    document.getElementById('send-amount').value = '';
    document.getElementById('recipient-address').value = '';
    updateTxPreview();
    renderUtxoChain();

    // 3秒后隐藏动画结果
    setTimeout(() => {
        document.getElementById('tx-result').style.display = 'none';
    }, 5000);
});

document.getElementById('trace-utxo').addEventListener('click', generateSampleChain);

// ==========================================
// 初始化
// ==========================================
function init() {
    // 添加一些初始 UTXO
    utxos = [
        { txid: randomTxId(), vout: 0, amount: 0.5 },
        { txid: randomTxId(), vout: 1, amount: 0.3 },
        { txid: randomTxId(), vout: 0, amount: 0.15 }
    ];
    renderUtxoList();
    updateTxPreview();
}

init();
