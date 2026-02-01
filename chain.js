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
            else { bytes.push((c >> 18) | 240); bytes.push(((c >> 12) & 63) | 128); bytes.push(((c >> 6) & 63) | 128); bytes.push((c & 63) | 128); }
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
// 区块链演示
// ==========================================
const blockchain = document.getElementById('blockchain');
const addBlockBtn = document.getElementById('add-block-btn');
const resetChainBtn = document.getElementById('reset-chain-btn');
const tamperWarning = document.getElementById('tamper-warning');

let chain = [];
const chainDifficulty = 2;
const chainTarget = '0'.repeat(chainDifficulty);

function createChainBlock(index, prevHash, data = '') {
    return {
        index,
        prevHash,
        timestamp: new Date().toISOString(),
        data: data || `区块 #${index} 的交易数据`,
        nonce: 0,
        hash: ''
    };
}

function calculateChainBlockHash(block) {
    const data = [block.prevHash, block.timestamp, block.data, block.nonce.toString()].join('|');
    return sha256(data);
}

function mineChainBlock(block) {
    let nonce = 0;
    while (nonce < 100000) {
        block.nonce = nonce;
        block.hash = calculateChainBlockHash(block);
        if (block.hash.startsWith(chainTarget)) return block;
        nonce++;
    }
    return block;
}

function renderBlockchain() {
    blockchain.innerHTML = '';

    chain.forEach((block, i) => {
        if (i > 0) {
            const link = document.createElement('div');
            link.className = 'chain-link';
            link.textContent = '→';
            blockchain.appendChild(link);
        }

        const isValid = block.hash.startsWith(chainTarget) && (i === 0 || block.prevHash === chain[i-1].hash);

        const blockEl = document.createElement('div');
        blockEl.className = `chain-block ${isValid ? 'valid' : 'invalid'}`;
        blockEl.innerHTML = `
            <div class="block-header">
                <span class="block-number">区块 #${block.index}</span>
                <span class="block-status">${isValid ? '✅' : '❌'}</span>
            </div>
            <div class="block-field">
                <label>前一哈希：</label>
                <input type="text" value="${block.prevHash.slice(0, 16)}..." readonly>
            </div>
            <div class="block-field">
                <label>数据：</label>
                <textarea data-block="${i}">${block.data}</textarea>
            </div>
            <div class="block-field">
                <label>Nonce：</label>
                <input type="text" value="${block.nonce}" readonly>
            </div>
            <div class="block-field">
                <label>哈希：</label>
                <div class="hash-display">${block.hash}</div>
            </div>
        `;
        blockchain.appendChild(blockEl);
    });

    // 添加数据修改监听
    document.querySelectorAll('.chain-block textarea').forEach(textarea => {
        textarea.addEventListener('input', (e) => {
            const blockIndex = parseInt(e.target.dataset.block);
            chain[blockIndex].data = e.target.value;
            chain[blockIndex].hash = calculateChainBlockHash(chain[blockIndex]);

            for (let i = blockIndex + 1; i < chain.length; i++) {
                chain[i].prevHash = chain[i-1].hash;
                chain[i].hash = calculateChainBlockHash(chain[i]);
            }

            renderBlockchain();
            tamperWarning.style.display = 'block';
        });
    });
}

function initializeChain() {
    chain = [];
    const genesis = createChainBlock(0, '0'.repeat(64), 'Genesis Block 🎉');
    mineChainBlock(genesis);
    chain.push(genesis);

    for (let i = 1; i <= 2; i++) {
        const block = createChainBlock(i, chain[i-1].hash);
        mineChainBlock(block);
        chain.push(block);
    }

    renderBlockchain();
    tamperWarning.style.display = 'none';
}

addBlockBtn.addEventListener('click', () => {
    addBlockBtn.disabled = true;
    addBlockBtn.textContent = '⛏️ 挖矿中...';

    setTimeout(() => {
        const prevBlock = chain[chain.length - 1];
        const newBlock = createChainBlock(chain.length, prevBlock.hash);
        mineChainBlock(newBlock);
        chain.push(newBlock);
        renderBlockchain();

        addBlockBtn.disabled = false;
        addBlockBtn.textContent = '➕ 添加新区块';
        blockchain.scrollLeft = blockchain.scrollWidth;
    }, 10);
});

resetChainBtn.addEventListener('click', initializeChain);

initializeChain();
