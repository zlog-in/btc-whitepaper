// ==========================================
// 国际化支持
// ==========================================

const translations = {
    zh: {
        // 导航
        'nav.logo': '₿ 比特币白皮书',
        'nav.home': '首页',
        'nav.hash': '哈希',
        'nav.signature': '签名',
        'nav.block': '区块',
        'nav.chain': '区块链',
        'nav.p2p': 'P2P 网络',
        'nav.pow': '工作量证明',

        // 首页
        'home.title': '📜 比特币：一种点对点的电子现金系统',
        'home.subtitle': 'Satoshi Nakamoto · 2008',
        'home.problem.title': '💡 核心问题',
        'home.problem.desc': '如何在没有可信第三方的情况下，实现数字货币的安全转账？',
        'home.hash.title': '哈希函数',
        'home.hash.desc': '将任意数据转换为固定长度的指纹',
        'home.signature.title': '数字签名',
        'home.signature.desc': '证明交易由所有者授权发起',
        'home.block.title': '区块结构',
        'home.block.desc': '交易数据的打包与组织方式',
        'home.chain.title': '区块链',
        'home.chain.desc': '通过哈希指针连接的不可篡改账本',
        'home.p2p.title': 'P2P 网络',
        'home.p2p.desc': '去中心化的点对点网络架构',
        'home.pow.title': '工作量证明',
        'home.pow.desc': '通过计算消耗来保证网络安全',
        'home.section.crypto': '🔧 密码学基础',
        'home.section.data': '📊 数据结构',
        'home.section.network': '🌐 网络与共识',

        // P2P 网络页面
        'p2p.title': 'P2P 网络',
        'p2p.desc': '比特币运行在一个去中心化的点对点网络上，没有中央服务器，每个节点都是平等的。',
        'p2p.sim.title': '🖥️ 网络模拟',
        'p2p.sim.desc': '点击添加节点，观察消息如何在网络中传播。点击任意节点发起广播。',
        'p2p.add.btn': '➕ 添加节点',
        'p2p.broadcast.btn': '📡 广播消息',
        'p2p.reset.btn': '🔄 重置网络',
        'p2p.nodes.label': '节点数量',
        'p2p.connections.label': '连接数',
        'p2p.messages.label': '消息传播',
        'p2p.status.idle': '空闲',
        'p2p.status.broadcasting': '广播中...',
        'p2p.status.complete': '完成',
        'p2p.features.title': '🔗 P2P 网络特性',
        'p2p.feature.1': '去中心化',
        'p2p.feature.1.desc': '没有中央服务器，任何节点故障不影响网络运行',
        'p2p.feature.2': '对等性',
        'p2p.feature.2.desc': '每个节点既是客户端也是服务器',
        'p2p.feature.3': '消息广播',
        'p2p.feature.3.desc': '交易和区块通过泛洪方式传播到整个网络',
        'p2p.feature.4': '自组织',
        'p2p.feature.4.desc': '节点可以随时加入或离开，网络自动调整',
        'p2p.process.title': '📨 消息传播过程',
        'p2p.process.desc': '当一个节点收到新交易或区块时，它会验证后转发给所有已连接的邻居节点。每个节点都会记录已见过的消息，避免重复转发，最终消息会扩散到整个网络。',
        'p2p.nav.prev': '← 工作量证明',
        'p2p.nav.next': '返回首页 →',
        'home.flow.title': '📝 比特币网络运作流程',
        'home.flow.1.title': '交易广播',
        'home.flow.1.desc': '新交易向所有节点广播',
        'home.flow.2.title': '区块打包',
        'home.flow.2.desc': '节点将交易打包成区块',
        'home.flow.3.title': '工作量证明',
        'home.flow.3.desc': '节点寻找有效的 Nonce',
        'home.flow.4.title': '广播区块',
        'home.flow.4.desc': '找到后向网络广播',
        'home.flow.5.title': '验证接受',
        'home.flow.5.desc': '其他节点验证并接受',
        'home.quote': '"我们提出了一种不依赖信任的电子交易系统。"',
        'home.quote.author': '— 中本聪，2008',

        // 哈希页面
        'hash.title': '密码学哈希函数',
        'hash.desc': 'SHA-256 将任意长度的输入转换为固定256位的输出。输入的微小变化会导致输出的巨大改变。',
        'hash.input.label': '输入任意内容：',
        'hash.input.placeholder': '在这里输入文字...',
        'hash.calc.btn': '🔢 计算哈希',
        'hash.binary.label': 'SHA-256 哈希值（二进制 256位）：',
        'hash.hex.label': 'SHA-256 哈希值（十六进制 64字符）：',
        'hash.click.calc': '点击按钮计算...',
        'hash.features.title': '🎯 哈希函数特性',
        'hash.feature.1': '确定性',
        'hash.feature.1.desc': '相同输入永远产生相同输出',
        'hash.feature.2': '快速计算',
        'hash.feature.2.desc': '可以快速计算任意输入的哈希',
        'hash.feature.3': '单向性',
        'hash.feature.3.desc': '无法从哈希值反推原始输入',
        'hash.feature.4': '雪崩效应',
        'hash.feature.4.desc': '输入微小变化导致输出剧烈变化',
        'hash.feature.5': '抗碰撞',
        'hash.feature.5.desc': '几乎不可能找到两个不同输入产生相同输出',
        'hash.nav.prev': '← 返回首页',
        'hash.nav.next': '数字签名 →',

        // 签名页面
        'sig.title': '数字签名',
        'sig.desc': '数字签名用于证明交易确实由比特币的所有者发起，防止他人伪造交易。',
        'sig.step1.title': '🔑 第一步：生成密钥对',
        'sig.step1.desc': '每个用户拥有一对密钥：私钥（保密）和公钥（公开）。私钥用于签名，公钥用于验证。',
        'sig.generate.btn': '🎲 生成新密钥对',
        'sig.private.label': '🔐 私钥（保密）',
        'sig.public.label': '🔓 公钥（公开）',
        'sig.click.generate': '点击生成...',
        'sig.step2.title': '✍️ 第二步：签名消息',
        'sig.step2.desc': '使用私钥对消息进行签名，生成数字签名。',
        'sig.message.label': '输入要签名的消息：',
        'sig.message.placeholder': '例如：Alice 转给 Bob 10 BTC',
        'sig.sign.btn': '✍️ 使用私钥签名',
        'sig.signature.label': '📝 数字签名：',
        'sig.ready': '准备就绪，可以签名...',
        'sig.signing': '签名中...',
        'sig.enter.message': '请输入消息',
        'sig.enter.both': '请输入消息和签名',
        'sig.generate.first': '先生成密钥对...',
        'sig.step3.title': '✅ 第三步：验证签名',
        'sig.step3.desc': '任何人都可以使用公钥验证签名是否有效。尝试修改消息，观察验证结果。',
        'sig.verify.message.label': '待验证的消息：',
        'sig.verify.sig.label': '待验证的签名：',
        'sig.verify.btn': '🔍 使用公钥验证',
        'sig.features.title': '🎯 数字签名的作用',
        'sig.feature.1': '身份验证',
        'sig.feature.1.desc': '证明交易由私钥持有者发起',
        'sig.feature.2': '不可伪造',
        'sig.feature.2.desc': '没有私钥无法生成有效签名',
        'sig.feature.3': '不可否认',
        'sig.feature.3.desc': '签名者无法否认曾经签名',
        'sig.feature.4': '完整性',
        'sig.feature.4.desc': '消息被篡改后签名失效',
        'sig.bitcoin.title': '₿ 在比特币中的应用',
        'sig.bitcoin.desc': '当你发起一笔比特币交易时，你的钱包会使用私钥对交易进行签名。网络中的其他节点使用你的公钥（从比特币地址派生）验证签名，确认这笔交易确实由你授权。',
        'sig.verify.valid': '✅ 签名有效！消息确实由私钥持有者签署。',
        'sig.verify.invalid': '❌ 签名无效！消息可能被篡改或签名伪造。',
        'sig.process.title': '📋 签名过程',
        'sig.process.msg': '原始消息',
        'sig.process.hash': 'SHA-256 哈希',
        'sig.process.sign': '私钥签名',
        'sig.process.result': '数字签名',
        'sig.verify.process.title': '🔍 验证过程',
        'sig.verify.process.msg': '待验证消息',
        'sig.verify.process.hash': '计算消息哈希',
        'sig.verify.process.recalc': '使用公钥重新计算签名',
        'sig.verify.process.provided': '提供的签名',
        'sig.verify.process.verifying': '验证中...',
        'sig.verify.process.valid': '签名有效',
        'sig.verify.process.invalid': '签名无效',
        'sig.nav.prev': '← 哈希函数',
        'sig.nav.next': '区块结构 →',

        // 区块页面
        'block.title': '区块结构',
        'block.desc': '区块包含交易数据和元信息。修改 Nonce 观察哈希值如何变化。',
        'block.number': '区块 #1',
        'block.status.pending': '⏳ 待挖矿',
        'block.status.valid': '✅ 有效区块',
        'block.prev.label': '前一区块哈希：',
        'block.time.label': '时间戳：',
        'block.data.label': '交易数据：',
        'block.data.default': 'Alice 转给 Bob 10 BTC\nBob 转给 Charlie 5 BTC',
        'block.nonce.label': 'Nonce（随机数）：',
        'block.hash.label': '区块哈希：',
        'block.hash.calculating': '计算中...',
        'block.difficulty.label': '难度（前导零数量）：',
        'block.mine.btn': '⛏️ 开始挖矿',
        'block.mine.stop': '⏹️ 停止挖矿',
        'block.features.title': '📋 区块组成部分',
        'block.feature.1': '前一区块哈希',
        'block.feature.1.desc': '指向前一个区块，形成链式结构',
        'block.feature.2': '时间戳',
        'block.feature.2.desc': '区块创建的时间',
        'block.feature.3': '交易数据',
        'block.feature.3.desc': '本区块包含的所有交易',
        'block.feature.4': 'Nonce',
        'block.feature.4.desc': '用于工作量证明的随机数',
        'block.feature.5': '区块哈希',
        'block.feature.5.desc': '以上所有数据的 SHA-256 哈希',
        'block.nav.prev': '← 数字签名',
        'block.nav.next': '区块链 →',

        // 区块链页面
        'chain.title': '区块链',
        'chain.desc': '区块通过哈希指针连接成链。尝试修改某个区块的数据，观察链的完整性如何被破坏。',
        'chain.add.btn': '➕ 添加新区块',
        'chain.reset.btn': '🔄 重置链',
        'chain.mining': '⛏️ 挖矿中...',
        'chain.tamper.title': '⚠️ 篡改检测',
        'chain.tamper.desc': '修改区块数据后，该区块及其后续所有区块的哈希都将失效。攻击者需要重新计算所有后续区块的工作量证明，这在计算上是不可行的。',
        'chain.features.title': '🔗 区块链特性',
        'chain.feature.1': '链式结构',
        'chain.feature.1.desc': '每个区块包含前一区块的哈希，形成不可断裂的链',
        'chain.feature.2': '不可篡改',
        'chain.feature.2.desc': '修改任意区块会导致后续所有区块失效',
        'chain.feature.3': '可验证',
        'chain.feature.3.desc': '任何人都可以独立验证整条链的完整性',
        'chain.feature.4': '分布式',
        'chain.feature.4.desc': '链的副本存储在网络中的每个节点',
        'chain.nav.prev': '← 区块结构',
        'chain.nav.next': '工作量证明 →',
        'chain.block.prev': '前一哈希：',
        'chain.block.data': '数据：',
        'chain.block.nonce': 'Nonce：',
        'chain.block.hash': '哈希：',

        // POW页面
        'pow.title': '工作量证明',
        'pow.desc': '矿工必须找到一个 Nonce，使得区块哈希满足难度要求（以特定数量的零开头）。',
        'pow.target.label': '目标难度',
        'pow.target.value': '哈希必须以 <code>00</code> 开头',
        'pow.attempts.label': '尝试次数',
        'pow.status.label': '状态',
        'pow.status.ready': '就绪',
        'pow.status.mining': '挖矿中...',
        'pow.status.paused': '已暂停',
        'pow.status.found': '🎉 找到有效 Nonce!',
        'pow.log.nonce': 'Nonce',
        'pow.log.hash': '哈希值',
        'pow.log.result': '结果',
        'pow.step.btn': '👆 单步尝试',
        'pow.auto.btn': '🚀 自动挖矿',
        'pow.auto.pause': '⏸️ 暂停',
        'pow.reset.btn': '🔄 重置',
        'pow.why.title': '💭 为什么需要工作量证明？',
        'pow.why.1': '防止双重支付',
        'pow.why.1.desc': '使篡改历史交易的代价极高',
        'pow.why.2': '公平发行',
        'pow.why.2.desc': '新币通过计算工作获得',
        'pow.why.3': '去中心化共识',
        'pow.why.3.desc': '最长链代表网络的共识',
        'pow.why.4': '安全保证',
        'pow.why.4.desc': '攻击者需要超过50%算力才能篡改',
        'pow.difficulty.title': '📊 难度调整',
        'pow.difficulty.desc': '比特币网络每 2016 个区块（约两周）自动调整难度，以保持平均每 10 分钟产生一个新区块。难度越高，需要的前导零越多，找到有效哈希所需的计算量也越大。',
        'pow.nav.prev': '← 区块链',
        'pow.nav.next': 'P2P 网络 →',

        // 页脚
        'footer.text': '基于 Satoshi Nakamoto 的',
        'footer.link': '比特币白皮书',
        'footer.suffix': '制作',
    },

    en: {
        // Navigation
        'nav.logo': '₿ Bitcoin Whitepaper',
        'nav.home': 'Home',
        'nav.hash': 'Hash',
        'nav.signature': 'Signature',
        'nav.block': 'Block',
        'nav.chain': 'Blockchain',
        'nav.p2p': 'P2P Network',
        'nav.pow': 'Proof of Work',

        // Home page
        'home.title': '📜 Bitcoin: A Peer-to-Peer Electronic Cash System',
        'home.subtitle': 'Satoshi Nakamoto · 2008',
        'home.problem.title': '💡 Core Problem',
        'home.problem.desc': 'How to achieve secure digital currency transfers without a trusted third party?',
        'home.hash.title': 'Hash Function',
        'home.hash.desc': 'Convert any data into a fixed-length fingerprint',
        'home.signature.title': 'Digital Signature',
        'home.signature.desc': 'Prove transactions are authorized by owners',
        'home.block.title': 'Block Structure',
        'home.block.desc': 'How transaction data is packaged and organized',
        'home.chain.title': 'Blockchain',
        'home.chain.desc': 'Immutable ledger linked by hash pointers',
        'home.p2p.title': 'P2P Network',
        'home.p2p.desc': 'Decentralized peer-to-peer network architecture',
        'home.pow.title': 'Proof of Work',
        'home.pow.desc': 'Secure the network through computational effort',
        'home.section.crypto': '🔧 Cryptography Basics',
        'home.section.data': '📊 Data Structures',
        'home.section.network': '🌐 Network & Consensus',

        // P2P Network page
        'p2p.title': 'P2P Network',
        'p2p.desc': 'Bitcoin runs on a decentralized peer-to-peer network with no central server, where every node is equal.',
        'p2p.sim.title': '🖥️ Network Simulation',
        'p2p.sim.desc': 'Click to add nodes and observe how messages propagate through the network. Click any node to broadcast.',
        'p2p.add.btn': '➕ Add Node',
        'p2p.broadcast.btn': '📡 Broadcast',
        'p2p.reset.btn': '🔄 Reset Network',
        'p2p.nodes.label': 'Nodes',
        'p2p.connections.label': 'Connections',
        'p2p.messages.label': 'Message Status',
        'p2p.status.idle': 'Idle',
        'p2p.status.broadcasting': 'Broadcasting...',
        'p2p.status.complete': 'Complete',
        'p2p.features.title': '🔗 P2P Network Properties',
        'p2p.feature.1': 'Decentralized',
        'p2p.feature.1.desc': 'No central server; any node failure doesn\'t affect the network',
        'p2p.feature.2': 'Peer Equality',
        'p2p.feature.2.desc': 'Every node is both client and server',
        'p2p.feature.3': 'Message Broadcast',
        'p2p.feature.3.desc': 'Transactions and blocks propagate via flooding',
        'p2p.feature.4': 'Self-organizing',
        'p2p.feature.4.desc': 'Nodes can join or leave anytime; network adapts automatically',
        'p2p.process.title': '📨 Message Propagation',
        'p2p.process.desc': 'When a node receives a new transaction or block, it validates and forwards it to all connected neighbors. Each node tracks seen messages to avoid duplicates, eventually spreading the message across the entire network.',
        'p2p.nav.prev': '← Proof of Work',
        'p2p.nav.next': 'Back to Home →',
        'home.flow.title': '📝 How Bitcoin Network Works',
        'home.flow.1.title': 'Broadcast',
        'home.flow.1.desc': 'New transactions broadcast to all nodes',
        'home.flow.2.title': 'Packaging',
        'home.flow.2.desc': 'Nodes package transactions into blocks',
        'home.flow.3.title': 'Proof of Work',
        'home.flow.3.desc': 'Nodes search for valid Nonce',
        'home.flow.4.title': 'Broadcast Block',
        'home.flow.4.desc': 'Broadcast to network when found',
        'home.flow.5.title': 'Verify & Accept',
        'home.flow.5.desc': 'Other nodes verify and accept',
        'home.quote': '"We propose a system for electronic transactions without relying on trust."',
        'home.quote.author': '— Satoshi Nakamoto, 2008',

        // Hash page
        'hash.title': 'Cryptographic Hash Function',
        'hash.desc': 'SHA-256 converts input of any length to a fixed 256-bit output. Small changes in input cause dramatic changes in output.',
        'hash.input.label': 'Enter any content:',
        'hash.input.placeholder': 'Type here...',
        'hash.calc.btn': '🔢 Calculate Hash',
        'hash.binary.label': 'SHA-256 Hash (Binary 256 bits):',
        'hash.hex.label': 'SHA-256 Hash (Hex 64 chars):',
        'hash.click.calc': 'Click button to calculate...',
        'hash.features.title': '🎯 Hash Function Properties',
        'hash.feature.1': 'Deterministic',
        'hash.feature.1.desc': 'Same input always produces same output',
        'hash.feature.2': 'Fast Computation',
        'hash.feature.2.desc': 'Can quickly compute hash of any input',
        'hash.feature.3': 'One-way',
        'hash.feature.3.desc': 'Cannot reverse hash to get original input',
        'hash.feature.4': 'Avalanche Effect',
        'hash.feature.4.desc': 'Small input change causes dramatic output change',
        'hash.feature.5': 'Collision Resistant',
        'hash.feature.5.desc': 'Nearly impossible to find two inputs with same output',
        'hash.nav.prev': '← Back to Home',
        'hash.nav.next': 'Digital Signature →',

        // Signature page
        'sig.title': 'Digital Signature',
        'sig.desc': 'Digital signatures prove that transactions are initiated by Bitcoin owners, preventing forgery.',
        'sig.step1.title': '🔑 Step 1: Generate Key Pair',
        'sig.step1.desc': 'Each user has a key pair: private key (secret) and public key (public). Private key signs, public key verifies.',
        'sig.generate.btn': '🎲 Generate New Key Pair',
        'sig.private.label': '🔐 Private Key (Secret)',
        'sig.public.label': '🔓 Public Key (Public)',
        'sig.click.generate': 'Click to generate...',
        'sig.step2.title': '✍️ Step 2: Sign Message',
        'sig.step2.desc': 'Use private key to sign the message, generating a digital signature.',
        'sig.message.label': 'Enter message to sign:',
        'sig.message.placeholder': 'e.g., Alice sends Bob 10 BTC',
        'sig.sign.btn': '✍️ Sign with Private Key',
        'sig.signature.label': '📝 Digital Signature:',
        'sig.ready': 'Ready to sign...',
        'sig.signing': 'Signing...',
        'sig.enter.message': 'Please enter a message',
        'sig.enter.both': 'Please enter message and signature',
        'sig.generate.first': 'Generate key pair first...',
        'sig.step3.title': '✅ Step 3: Verify Signature',
        'sig.step3.desc': 'Anyone can verify if the signature is valid using the public key. Try modifying the message.',
        'sig.verify.message.label': 'Message to verify:',
        'sig.verify.sig.label': 'Signature to verify:',
        'sig.verify.btn': '🔍 Verify with Public Key',
        'sig.features.title': '🎯 Purpose of Digital Signatures',
        'sig.feature.1': 'Authentication',
        'sig.feature.1.desc': 'Proves transaction is from private key holder',
        'sig.feature.2': 'Unforgeable',
        'sig.feature.2.desc': 'Cannot create valid signature without private key',
        'sig.feature.3': 'Non-repudiation',
        'sig.feature.3.desc': 'Signer cannot deny having signed',
        'sig.feature.4': 'Integrity',
        'sig.feature.4.desc': 'Signature becomes invalid if message is altered',
        'sig.bitcoin.title': '₿ Application in Bitcoin',
        'sig.bitcoin.desc': 'When you initiate a Bitcoin transaction, your wallet signs it with your private key. Other nodes verify the signature using your public key (derived from your Bitcoin address), confirming the transaction is authorized by you.',
        'sig.verify.valid': '✅ Valid signature! Message was signed by the private key holder.',
        'sig.verify.invalid': '❌ Invalid signature! Message may have been tampered with.',
        'sig.process.title': '📋 Signing Process',
        'sig.process.msg': 'Original Message',
        'sig.process.hash': 'SHA-256 Hash',
        'sig.process.sign': 'Sign with Private Key',
        'sig.process.result': 'Digital Signature',
        'sig.verify.process.title': '🔍 Verification Process',
        'sig.verify.process.msg': 'Message to Verify',
        'sig.verify.process.hash': 'Compute Message Hash',
        'sig.verify.process.recalc': 'Recalculate Signature with Public Key',
        'sig.verify.process.provided': 'Provided Signature',
        'sig.verify.process.verifying': 'Verifying...',
        'sig.verify.process.valid': 'Valid Signature',
        'sig.verify.process.invalid': 'Invalid Signature',
        'sig.nav.prev': '← Hash Function',
        'sig.nav.next': 'Block Structure →',

        // Block page
        'block.title': 'Block Structure',
        'block.desc': 'A block contains transaction data and metadata. Modify the Nonce to see how the hash changes.',
        'block.number': 'Block #1',
        'block.status.pending': '⏳ Pending',
        'block.status.valid': '✅ Valid Block',
        'block.prev.label': 'Previous Block Hash:',
        'block.time.label': 'Timestamp:',
        'block.data.label': 'Transaction Data:',
        'block.data.default': 'Alice sends Bob 10 BTC\nBob sends Charlie 5 BTC',
        'block.nonce.label': 'Nonce:',
        'block.hash.label': 'Block Hash:',
        'block.hash.calculating': 'Calculating...',
        'block.difficulty.label': 'Difficulty (leading zeros):',
        'block.mine.btn': '⛏️ Start Mining',
        'block.mine.stop': '⏹️ Stop Mining',
        'block.features.title': '📋 Block Components',
        'block.feature.1': 'Previous Hash',
        'block.feature.1.desc': 'Points to previous block, forming a chain',
        'block.feature.2': 'Timestamp',
        'block.feature.2.desc': 'When the block was created',
        'block.feature.3': 'Transaction Data',
        'block.feature.3.desc': 'All transactions in this block',
        'block.feature.4': 'Nonce',
        'block.feature.4.desc': 'Random number for proof of work',
        'block.feature.5': 'Block Hash',
        'block.feature.5.desc': 'SHA-256 hash of all above data',
        'block.nav.prev': '← Digital Signature',
        'block.nav.next': 'Blockchain →',

        // Blockchain page
        'chain.title': 'Blockchain',
        'chain.desc': 'Blocks are linked by hash pointers. Try modifying a block\'s data to see how chain integrity is broken.',
        'chain.add.btn': '➕ Add New Block',
        'chain.reset.btn': '🔄 Reset Chain',
        'chain.mining': '⛏️ Mining...',
        'chain.tamper.title': '⚠️ Tamper Detection',
        'chain.tamper.desc': 'After modifying block data, that block and all subsequent blocks become invalid. An attacker would need to recalculate proof of work for all following blocks, which is computationally infeasible.',
        'chain.features.title': '🔗 Blockchain Properties',
        'chain.feature.1': 'Chain Structure',
        'chain.feature.1.desc': 'Each block contains previous block\'s hash, forming an unbreakable chain',
        'chain.feature.2': 'Immutable',
        'chain.feature.2.desc': 'Modifying any block invalidates all subsequent blocks',
        'chain.feature.3': 'Verifiable',
        'chain.feature.3.desc': 'Anyone can independently verify the entire chain',
        'chain.feature.4': 'Distributed',
        'chain.feature.4.desc': 'Copies of the chain are stored on every node',
        'chain.nav.prev': '← Block Structure',
        'chain.nav.next': 'Proof of Work →',
        'chain.block.prev': 'Prev Hash:',
        'chain.block.data': 'Data:',
        'chain.block.nonce': 'Nonce:',
        'chain.block.hash': 'Hash:',

        // POW page
        'pow.title': 'Proof of Work',
        'pow.desc': 'Miners must find a Nonce that makes the block hash meet difficulty requirements (starting with specific number of zeros).',
        'pow.target.label': 'Target Difficulty',
        'pow.target.value': 'Hash must start with <code>00</code>',
        'pow.attempts.label': 'Attempts',
        'pow.status.label': 'Status',
        'pow.status.ready': 'Ready',
        'pow.status.mining': 'Mining...',
        'pow.status.paused': 'Paused',
        'pow.status.found': '🎉 Valid Nonce Found!',
        'pow.log.nonce': 'Nonce',
        'pow.log.hash': 'Hash',
        'pow.log.result': 'Result',
        'pow.step.btn': '👆 Single Step',
        'pow.auto.btn': '🚀 Auto Mine',
        'pow.auto.pause': '⏸️ Pause',
        'pow.reset.btn': '🔄 Reset',
        'pow.why.title': '💭 Why Proof of Work?',
        'pow.why.1': 'Prevent Double Spending',
        'pow.why.1.desc': 'Makes tampering with history extremely costly',
        'pow.why.2': 'Fair Issuance',
        'pow.why.2.desc': 'New coins earned through computational work',
        'pow.why.3': 'Decentralized Consensus',
        'pow.why.3.desc': 'Longest chain represents network consensus',
        'pow.why.4': 'Security Guarantee',
        'pow.why.4.desc': 'Attacker needs >50% computing power to tamper',
        'pow.difficulty.title': '📊 Difficulty Adjustment',
        'pow.difficulty.desc': 'Bitcoin network adjusts difficulty every 2016 blocks (~2 weeks) to maintain an average of one new block every 10 minutes. Higher difficulty means more leading zeros required, thus more computation needed.',
        'pow.nav.prev': '← Blockchain',
        'pow.nav.next': 'P2P Network →',

        // Footer
        'footer.text': 'Based on Satoshi Nakamoto\'s ',
        'footer.link': 'Bitcoin Whitepaper',
        'footer.suffix': '',
    }
};

// 当前语言
let currentLang = localStorage.getItem('lang') || 'zh';

// 获取翻译
function t(key) {
    return translations[currentLang][key] || key;
}

// 切换语言
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    updatePageTexts();
    updateLangButton();
}

// 更新语言按钮状态
function updateLangButton() {
    const btn = document.getElementById('lang-toggle');
    if (btn) {
        btn.textContent = currentLang === 'zh' ? 'EN' : '中';
    }
}

// 更新页面所有文本
function updatePageTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = t(key);
        if (el.tagName === 'INPUT' && el.type === 'text') {
            el.placeholder = text;
        } else if (el.tagName === 'TEXTAREA') {
            if (el.hasAttribute('data-i18n-placeholder')) {
                el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
            }
            if (el.hasAttribute('data-i18n-value')) {
                el.value = t(el.getAttribute('data-i18n-value'));
            }
        } else if (key.includes('.value') || el.hasAttribute('data-i18n-html')) {
            el.innerHTML = text;
        } else {
            el.textContent = text;
        }
    });
}

// 初始化语言切换按钮
function initLangToggle() {
    const nav = document.querySelector('.nav-content');
    if (nav && !document.getElementById('lang-toggle')) {
        const btn = document.createElement('button');
        btn.id = 'lang-toggle';
        btn.className = 'lang-btn';
        btn.textContent = currentLang === 'zh' ? 'EN' : '中';
        btn.addEventListener('click', () => {
            setLanguage(currentLang === 'zh' ? 'en' : 'zh');
        });
        nav.appendChild(btn);
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    initLangToggle();
    updatePageTexts();
});
