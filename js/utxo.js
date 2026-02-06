(function() {
// ==========================================
// UTXO 数据结构
// ==========================================
let utxos = [];
let selectedUtxos = [];
let txHistory = [];
let txCounter = 0;

const FEE = 0.0001; // 固定手续费

// 钱包密钥对
let walletPrivateKey = '';
let walletPublicKey = '';
let walletAddress = '';

// ==========================================
// SHA-256 哈希函数
// ==========================================
function sha256(message) {
    function utf8Encode(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if (c < 128) bytes.push(c);
            else if (c < 2048) { bytes.push((c >> 6) | 192); bytes.push((c & 63) | 128); }
            else if (c < 65536) { bytes.push((c >> 12) | 224); bytes.push(((c >> 6) & 63) | 128); bytes.push((c & 63) | 128); }
        }
        return bytes;
    }
    function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }

    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    const k = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];

    const bytes = utf8Encode(message);
    const bitLength = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push((bitLength >>> (i * 8)) & 0xff);

    for (let chunk = 0; chunk < bytes.length; chunk += 64) {
        const w = new Array(64);
        for (let i = 0; i < 16; i++) w[i] = (bytes[chunk+i*4]<<24)|(bytes[chunk+i*4+1]<<16)|(bytes[chunk+i*4+2]<<8)|bytes[chunk+i*4+3];
        for (let i = 16; i < 64; i++) { const s0 = rightRotate(w[i-15],7)^rightRotate(w[i-15],18)^(w[i-15]>>>3); const s1 = rightRotate(w[i-2],17)^rightRotate(w[i-2],19)^(w[i-2]>>>10); w[i] = (w[i-16]+s0+w[i-7]+s1)|0; }
        let a=h0,b=h1,c=h2,d=h3,e=h4,f=h5,g=h6,h=h7;
        for (let i = 0; i < 64; i++) { const S1=rightRotate(e,6)^rightRotate(e,11)^rightRotate(e,25); const ch=(e&f)^(~e&g); const temp1=(h+S1+ch+k[i]+w[i])|0; const S0=rightRotate(a,2)^rightRotate(a,13)^rightRotate(a,22); const maj=(a&b)^(a&c)^(b&c); const temp2=(S0+maj)|0; h=g;g=f;f=e;e=(d+temp1)|0;d=c;c=b;b=a;a=(temp1+temp2)|0; }
        h0=(h0+a)|0;h1=(h1+b)|0;h2=(h2+c)|0;h3=(h3+d)|0;h4=(h4+e)|0;h5=(h5+f)|0;h6=(h6+g)|0;h7=(h7+h)|0;
    }
    function toHex(n) { return ('00000000'+(n>>>0).toString(16)).slice(-8); }
    return toHex(h0)+toHex(h1)+toHex(h2)+toHex(h3)+toHex(h4)+toHex(h5)+toHex(h6)+toHex(h7);
}

// ==========================================
// 密钥与地址生成
// ==========================================

// 生成随机十六进制字符串
function randomHex(length) {
    let result = '';
    const chars = '0123456789abcdef';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * 16)];
    }
    return result;
}

// 生成随机交易 ID
function randomTxId() {
    return randomHex(64);
}

// 从私钥生成公钥（简化：实际使用椭圆曲线）
function privateKeyToPublicKey(privKey) {
    return sha256('secp256k1:' + privKey).substring(0, 66);
}

// 从公钥生成地址（简化：实际使用 RIPEMD160 + Base58Check）
function publicKeyToAddress(pubKey) {
    const hash = sha256('address:' + pubKey);
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '1';
    for (let i = 0; i < 33; i++) {
        const idx = parseInt(hash.substring(i * 2, i * 2 + 2), 16) % chars.length;
        result += chars[idx];
    }
    return result;
}

// 生成钱包密钥对
function generateWallet() {
    walletPrivateKey = randomHex(64);
    walletPublicKey = privateKeyToPublicKey(walletPrivateKey);
    walletAddress = publicKeyToAddress(walletPublicKey);
    return { privateKey: walletPrivateKey, publicKey: walletPublicKey, address: walletAddress };
}

// 生成随机地址（用于接收方）
function randomAddress() {
    const tempPriv = randomHex(64);
    const tempPub = privateKeyToPublicKey(tempPriv);
    return publicKeyToAddress(tempPub);
}

// 签名交易
function signTransaction(txData, privKey) {
    const txHash = sha256(JSON.stringify(txData));
    // 模拟 ECDSA 签名 (r, s)
    const r = sha256(privKey + txHash + 'r').substring(0, 64);
    const s = sha256(privKey + txHash + 's').substring(0, 64);
    return { r, s, txHash };
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
            <div class="utxo-status ${isSelected ? 'selected' : 'unspent'}">${isSelected ? (typeof t === 'function' ? t('utxo.status.selected') : '✓ 已选') : (typeof t === 'function' ? t('utxo.status.available') : '○ 可用')}</div>
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
// 钱包密钥显示
// ==========================================
function updateWalletDisplay() {
    document.getElementById('wallet-private-key').textContent = truncate(walletPrivateKey, 12);
    document.getElementById('wallet-public-key').textContent = truncate(walletPublicKey, 12);
    document.getElementById('wallet-address').textContent = truncate(walletAddress, 10);
}

// ==========================================
// 事件监听器
// ==========================================

// 生成新钱包
document.getElementById('new-wallet').addEventListener('click', () => {
    generateWallet();
    updateWalletDisplay();
    // 清空 UTXO（新钱包没有余额）
    utxos = [];
    selectedUtxos = [];
    renderUtxoList();
    updateTxInputs();
    updateTxPreview();
});

// 生成随机接收地址
document.getElementById('gen-recipient').addEventListener('click', () => {
    const addr = randomAddress();
    document.getElementById('recipient-address').value = addr;
    updateTxPreview();
});

// 模拟收款
document.getElementById('add-utxo').addEventListener('click', () => {
    // 添加随机 UTXO
    const amount = Math.round((Math.random() * 0.9 + 0.1) * 10000) / 10000;
    const txid = randomTxId();
    const fromAddress = randomAddress();

    utxos.push({
        txid: txid,
        vout: Math.floor(Math.random() * 3),
        amount: amount
    });
    renderUtxoList();

    // 显示收款详情
    const receiveInfo = document.getElementById('receive-info');
    receiveInfo.style.display = 'block';
    document.getElementById('receive-txid').textContent = truncate(txid, 10);
    document.getElementById('receive-amount').textContent = amount.toFixed(4) + ' BTC';
    document.getElementById('receive-from').textContent = truncate(fromAddress, 10);

    // 3秒后隐藏
    setTimeout(() => {
        receiveInfo.style.display = 'none';
    }, 4000);
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
        outputs.push({ address: walletAddress, amount: change, isChange: true });
    }

    // 创建交易数据并签名
    const txData = {
        inputs: inputs.map(i => ({ txid: i.txid, vout: i.vout })),
        outputs: outputs.map(o => ({ address: o.address, amount: o.amount })),
        timestamp: Date.now()
    };
    const signature = signTransaction(txData, walletPrivateKey);

    // 记录交易历史
    txCounter++;
    txHistory.push({ inputs: [...inputs], outputs: [...outputs] });

    // 播放动画
    await animateTransaction(inputs, outputs);

    // 显示签名信息
    const resultDiv = document.getElementById('tx-result');
    const sigHtml = `
        <div class="tx-signature">
            <h4>${typeof t === 'function' ? t('utxo.sig.title') : '🔏 交易签名'}</h4>
            <div class="sig-details">
                <div class="sig-row">
                    <span class="sig-label">${typeof t === 'function' ? t('utxo.sig.txhash') : '交易哈希:'}</span>
                    <code class="sig-value">${truncate(signature.txHash, 12)}</code>
                </div>
                <div class="sig-row">
                    <span class="sig-label">${typeof t === 'function' ? t('utxo.sig.r') : '签名 r:'}</span>
                    <code class="sig-value">${truncate(signature.r, 12)}</code>
                </div>
                <div class="sig-row">
                    <span class="sig-label">${typeof t === 'function' ? t('utxo.sig.s') : '签名 s:'}</span>
                    <code class="sig-value">${truncate(signature.s, 12)}</code>
                </div>
            </div>
            <p class="sig-note">${typeof t === 'function' ? t('utxo.sig.note') : '✅ 使用私钥签名后广播到网络'}</p>
        </div>
    `;
    resultDiv.innerHTML += sigHtml;

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

    // 6秒后隐藏动画结果
    setTimeout(() => {
        document.getElementById('tx-result').style.display = 'none';
    }, 8000);
});

document.getElementById('trace-utxo').addEventListener('click', generateSampleChain);

// ==========================================
// 初始化
// ==========================================
function init() {
    // 生成钱包密钥对
    generateWallet();
    updateWalletDisplay();

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

})();
