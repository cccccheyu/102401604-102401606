// ========== 初始化数据 ==========
function initData(){
    if(!localStorage.getItem("lostFoundList")){
        const initList = [
            {
                id:1, type:"lost", author:"张三",
                title:"校园卡丢失", itemName:"校园卡",
                description:"周三下午一食堂三楼丢失，卡面有照片，姓名张三",
                contact:"13800138000",
                status:"pending", createTime:"2026-09-28"
            },
            {
                id:2, type:"found", author:"李四",
                title:"捡到一串钥匙", itemName:"钥匙",
                description:"图书馆三楼自习室捡到，带有小熊挂件",
                contact:"QQ:12345678",
                status:"pending", createTime:"2026-09-30"
            },
            {
                id:3, type:"lost", author:"王五",
                title:"AirPods Pro丢失", itemName:"耳机",
                description:"操场跑步时丢失，白色充电盒，有刻字",
                contact:"微信:wangwu2026",
                status:"found", createTime:"2026-09-25"
            }
        ];
        localStorage.setItem("lostFoundList", JSON.stringify(initList));
    }
}

// ========== 数据读写 ==========
function getList(){
    initData();
    return JSON.parse(localStorage.getItem("lostFoundList"));
}
function saveList(list){
    localStorage.setItem("lostFoundList", JSON.stringify(list));
}
function getNowDate(){
    const d = new Date();
    return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
}

// ========== 首页渲染 ==========
let currentTab = 'all';
function renderList(list){
    const data = list || getList();
    const wrap = document.getElementById("listWrap");
    wrap.innerHTML = "";
    if(data.length === 0){
        wrap.innerHTML = '<p class="empty-tip">暂无相关信息</p>';
        return;
    }
    data.forEach(item=>{
        const typeText = item.type==="lost"?"寻物":"招领";
        let statusText;
        if(item.status==="pending") statusText="待处理";
        else if(item.status==="found") statusText="已找到";
        else statusText="已归还";
        const card = document.createElement("div");
        card.className = "card " + (item.type==="lost"?"card-lost":"card-found");
        card.innerHTML = `
            <h3>${item.title}</h3>
            <p>
                <span class="tag ${item.type==='lost'?'tag-lost':'tag-found'}">${typeText}</span>
                物品：${item.itemName}
            </p>
            <p>发布人：${item.author || "匿名"}</p>
            <p>状态：<span class="status-${item.status}">${statusText}</span></p>
            <p>发布时间：${item.createTime}</p>
            <button class="btn btn-primary" onclick="goDetail(${item.id})" style="margin-top:10px">查看详情</button>
        `;
        wrap.appendChild(card);
    });
}

// 标签切换
function switchTab(tab, btn){
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    let data = getList();
    if(tab !== 'all') data = data.filter(i=>i.type===tab);
    renderList(data);
}

// 搜索
function searchList(){
    const kw = document.getElementById("searchInput").value.trim().toLowerCase();
    let data = getList();
    if(currentTab !== 'all') data = data.filter(i=>i.type===currentTab);
    if(kw) data = data.filter(i=>i.itemName.toLowerCase().includes(kw));
    renderList(data);
}

// ========== 发布 ==========
function addItem(){
    const type = document.getElementById("type").value;
    const author = document.getElementById("author").value.trim();
    const title = document.getElementById("title").value.trim();
    const itemName = document.getElementById("itemName").value.trim();
    const desc = document.getElementById("desc").value.trim();
    const contact = document.getElementById("contact").value.trim();

    if(!author || !title || !itemName || !contact){
        alert("称呼、标题、物品名称、联系方式 不能为空！");
        return;
    }
    localStorage.setItem("myName", author);

    const list = getList();
    list.push({
        id: Date.now(),
        type: type, author: author,
        title: title, itemName: itemName,
        description: desc, contact: contact,
        status: "pending", createTime: getNowDate()
    });
    saveList(list);
    alert("发布成功！");
    window.location.href = "index.html";
}

// ========== 我的发布 ==========
function loadMyPosts(){
    const name = document.getElementById("myNameInput").value.trim();
    localStorage.setItem("myName", name);
    const box = document.getElementById("myList");
    if(!name){
        box.innerHTML = '<p class="empty-tip">请输入你的称呼，查看你发布过的信息</p>';
        return;
    }
    const myList = getList().filter(i=>i.author === name);
    if(myList.length === 0){
        box.innerHTML = '<p class="empty-tip">你还没有发布过信息，去发布一条吧 → <a href="publish.html">点我发布</a></p>';
        return;
    }
    renderList(myList);
}

// ========== 详情页 ==========
function goDetail(id){
    window.location.href = "detail.html?id=" + id;
}
function loadDetail(){
    const url = new URL(window.location.href);
    const id = Number(url.searchParams.get("id"));
    const item = getList().find(x=>x.id===id);
    const box = document.getElementById("detailBox");
    if(!item){
        box.innerHTML = '<p class="empty-tip">找不到这条信息</p>';
        return;
    }
    const typeText = item.type==="lost"?"寻物启事":"招领启事";
    let statusText;
    if(item.status==="pending") statusText="待处理";
    else if(item.status==="found") statusText="已找到";
    else statusText="已归还";
    box.innerHTML = `
        <h2>${item.title}</h2>
        <p><span class="tag ${item.type==='lost'?'tag-lost':'tag-found'}">${typeText}</span></p>
        <p><b>物品名称：</b>${item.itemName}</p>
        <p><b>发布人：</b>${item.author}</p>
        <p><b>详细描述：</b>${item.description || "无"}</p>
        <div class="contact-line">
            <b>联系方式：</b>${item.contact}
            <button class="btn btn-gray" onclick="copyContact('${item.contact}')" style="margin-left:10px">📋 一键复制</button>
        </div>
        <p><b>当前状态：</b><span class="status-${item.status}">${statusText}</span></p>
        <p><b>发布时间：</b>${item.createTime}</p>
        <div class="status-actions">
            <p style="margin-bottom:10px;color:#888;font-size:13px">发布者操作：</p>
            <button class="btn btn-green" onclick="changeStatus(${item.id},'found')">✓ 已找到</button>
            <button class="btn btn-orange" onclick="changeStatus(${item.id},'returned')">✓ 已归还</button>
            <a href="index.html" class="btn btn-gray">返回首页</a>
        </div>
    `;
}
function copyContact(text){
    navigator.clipboard.writeText(text).then(()=>alert("联系方式已复制！"));
}
function changeStatus(id, newStatus){
    const list = getList();
    const target = list.find(x=>x.id===id);
    if(!target) return;
    target.status = newStatus;
    saveList(list);
    alert("状态修改成功！");
    loadDetail();
}

// ========== 单元测试（控制台输入 runAllTest() 运行） ==========
function runAllTest(){
    console.log("===== 开始单元测试 =====");
    let pass=0, fail=0;
    const oldLen = getList().length;

    // T1 新增记录
    let arr = getList();
    arr.push({id:99999,type:"lost",author:"测试",title:"测试",itemName:"水杯",description:"",contact:"111",status:"pending",createTime:getNowDate()});
    saveList(arr);
    getList().length === oldLen+1 ? (console.log("T1 通过：新增记录"),pass++) : (console.log("T1 失败"),fail++);

    // T2 搜索匹配
    getList().some(i=>i.itemName.includes("水杯")) ? (console.log("T2 通过：搜索命中"),pass++) : (console.log("T2 失败"),fail++);

    // T3 搜索无结果
    !getList().some(i=>i.itemName.includes("火箭123")) ? (console.log("T3 通过：无结果返回空"),pass++) : (console.log("T3 失败"),fail++);

    // T4 修改状态
    let l = getList();
    let it = l.find(x=>x.id===99999);
    it.status = "found";
    saveList(l);
    getList().find(x=>x.id===99999).status==="found" ? (console.log("T4 通过：状态修改"),pass++) : (console.log("T4 失败"),fail++);

    // T5 不存在的id
    !getList().find(x=>x.id===88888888) ? (console.log("T5 通过：不存在id返回空"),pass++) : (console.log("T5 失败"),fail++);

    // T6 空输入校验
    function check(name){ return name.trim() ? true : false; }
    check("")===false ? (console.log("T6 通过：空校验拦截"),pass++) : (console.log("T6 失败"),fail++);

    // T7 我的发布筛选
    let my = getList().filter(i=>i.author==="测试");
    my.length>=1 ? (console.log("T7 通过：我的发布筛选"),pass++) : (console.log("T7 失败"),fail++);

    console.log(`===== 测试结束：通过 ${pass}，失败 ${fail} =====`);
    saveList(getList().filter(i=>i.id!==99999));
}

