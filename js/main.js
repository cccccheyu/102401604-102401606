// 初始化本地存储
function initData(){
    if(!localStorage.getItem("lostFoundList")){
        const initList = [
            {
                id:1,
                type:"lost",
                title:"校园卡丢失",
                itemName:"校园卡",
                description:"周三下午一食堂丢失，姓名张三",
                contact:"13800138000",
                status:"pending",
                createTime:"2026-10-01"
            },
            {
                id:2,
                type:"found",
                title:"捡到一串钥匙",
                itemName:"钥匙",
                description:"图书馆三楼捡到，带有小熊挂件",
                contact:"QQ:12345678",
                status:"pending",
                createTime:"2026-10-01"
            }
        ]
        localStorage.setItem("lostFoundList",JSON.stringify(initList));
    }
}
// 获取全部列表
function getList(){
    initData();
    return JSON.parse(localStorage.getItem("lostFoundList"));
}
//保存列表
function saveList(list){
    localStorage.setItem("lostFoundList",JSON.stringify(list));
}
//渲染首页列表
function renderList(list){
    const data = list || getList();
    const wrap = document.getElementById("listWrap");
    wrap.innerHTML = "";
    data.forEach(item=>{
        const typeText = item.type==="lost"?"寻物":"招领";
        let statusText;
        if(item.status==="pending") statusText="待处理";
        else if(item.status==="found") statusText="已找到";
        else statusText="已归还";
        const card = document.createElement("div");
        card.className = `card ${item.type==="lost"?"card-lost":"card-found"}`;
        card.innerHTML=`
            <h3>${item.title}</h3>
            <p>类型：${typeText}</p>
            <p>物品：${item.itemName}</p>
            <p>状态：<span class="status-${item.status}">${statusText}</span></p>
            <p>发布时间：${item.createTime}</p>
            <button onclick="goDetail(${item.id})" class="btn">查看详情</button>
        `
        wrap.appendChild(card);
    })
}
//跳转详情
function goDetail(id){
    window.location.href=`detail.html?id=${id}`
}
//搜索功能
function searchList(){
    const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
    const allList = getList();
    const filter = allList.filter(item=>item.itemName.toLowerCase().includes(keyword));
    renderList(filter);
}
//新增一条记录
function addItem(){
    const type = document.getElementById("type").value;
    const title = document.getElementById("title").value.trim();
    const itemName = document.getElementById("itemName").value.trim();
    const desc = document.getElementById("desc").value.trim();
    const contact = document.getElementById("contact").value.trim();
    if(!title||!itemName||!contact){
        alert("标题、物品名称、联系方式不能为空！");
        return;
    }
    const list = getList();
    const newId = Date.now();
    const newItem = {
        id:newId,
        type:type,
        title:title,
        itemName:itemName,
        description:desc,
        contact:contact,
        status:"pending",
        createTime:getNowDate()
    }
    list.push(newItem);
    saveList(list);
}
//获取当前日期
function getNowDate(){
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
}
//加载详情页面
function loadDetail(){
    const url = new URL(window.location.href);
    const id = Number(url.searchParams.get("id"));
    const list = getList();
    const item = list.find(x=>x.id===id);
    const box = document.getElementById("detailBox");
    if(!item){
        box.innerHTML="<p>找不到这条信息</p>";
        return;
    }
    const typeText = item.type==="lost"?"寻物":"招领";
    let statusText;
    if(item.status==="pending") statusText="待处理";
    else if(item.status==="found") statusText="已找到";
    else statusText="已归还";
    box.innerHTML=`
        <h2>${item.title}</h2>
        <p>类型：${typeText}</p>
        <p>物品名称：${item.itemName}</p>
        <p>描述：${item.description}</p>
        <p>联系方式：${item.contact}</p>
        <button onclick="copyContact('${item.contact}')" class="btn copy-btn">一键复制联系方式</button>
        <p>当前状态：<span class="status-${item.status}">${statusText}</span></p>
        <br/>
        <p>修改状态（发布者操作）：</p>
        <button onclick="changeStatus(${item.id},'found')" class="btn">已找到</button>
        <button onclick="changeStatus(${item.id},'returned')" class="btn">已归还</button>
    `
}
//复制联系方式
function copyContact(text){
    navigator.clipboard.writeText(text).then(()=>alert("复制成功！"))
}
//修改状态
function changeStatus(id,newStatus){
    const list = getList();
    const target = list.find(x=>x.id===id);
    if(!target) return;
    target.status = newStatus;
    saveList(list);
    alert("状态修改成功！");
    loadDetail();
}

//=====单元测试（写在main.js末尾，浏览器F12控制台运行，不用上传github）
function runAllTest(){
    console.log("====开始单元测试====");
    let pass = 0,fail=0;
    //T1：新增记录
    const oldLen = getList().length;
    const tempItem = {
        id:99999,
        type:"lost",
        title:"测试物品",
        itemName:"水杯",
        description:"测试",
        contact:"111111",
        status:"pending",
        createTime:getNowDate()
    }
    let arr = getList();
    arr.push(tempItem);
    saveList(arr);
    if(getList().length === oldLen+1){console.log("T1通过");pass++}else{console.log("T1失败");fail++}
    //T2 搜索匹配
    const res = getList().filter(i=>i.itemName.includes("水杯"));
    if(res.length>0){console.log("T2通过");pass++}else{console.log("T2失败");fail++}
    //T3 搜索不存在关键词
    const emptyRes = getList().filter(i=>i.itemName.includes("火箭"));
    if(emptyRes.length===0){console.log("T3通过");pass++}else{console.log("T3失败");fail++}
    //T4 修改状态
    let testItem = getList().find(x=>x.id===99999);
    testItem.status="found";
    saveList(getList());
    if(getList().find(x=>x.id===99999).status==="found"){console.log("T4通过");pass++}else{console.log("T4失败");fail++}
    //T5 查询不存在id
    const nullItem = getList().find(x=>x.id===88888888);
    if(nullItem === undefined){console.log("T5通过");pass++}else{console.log("T5失败");fail++}
    //T6 空物品名校验
    function checkItem(name){
        if(!name.trim()) return false;
        return true;
    }
    if(checkItem("")===false){console.log("T6通过");pass++}else{console.log("T6失败");fail++}
    //T7读取列表
    if(Array.isArray(getList())){console.log("T7通过");pass++}else{console.log("T7失败");fail++}
    console.log(`测试结束：通过${pass}，失败${fail}`);
    //清理测试数据
    let cleanList = getList().filter(i=>i.id!==99999);
    saveList(cleanList);
}
//在浏览器控制台输入 runAllTest() 执行全部测试
