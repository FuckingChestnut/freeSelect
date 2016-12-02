## freeSelect
#### 一个拥有搜索和创建功能的下拉框

##### 详细配置
* selector_id: ""; //模块ID【String类型】
* source_data: []; //源数据【Array类型】
* show_custom: true; //是否显示自定义选项【Boolean类型】
* request_data: {}; //添加自定义选项时的其他请求数据【Object类型】
* connect_name: ""; //新增字段名【String类型】
* tips: "没有找到你想要的"; //无匹配提示【String类型】
* default_selected_text: "请选择"; //默认提示【String类型】
* change_callback: function(){}; //修改选中选项回调方法【Function类型】
* custom_callback: function(){}; //选中自定义选项回调方法【Function类型】

> 1. 源数据既可以来自select元素内部的option，也可以在source_data当中配置
> 2. 当show_custom为false时，

##### 下面是一个完整的配置和实例化DEMO：
```
var tempOption = {
    selector_id: "select", //模块ID
    source_data: [], //源数据
    show_custom: true,
    request_data: {},
    connect_name: "",
    tips: "没有找到你想要的",
    default_selected_text: "请选择",
    change_callback: function(input) {
        console.log(input);
    },
    custom_callback: function(input) {
        var tempThis = this,
            tempFunction = function() {
                var tempSourceData = tempThis.getSourceData(),
                    tempItemData = {};
                //填充新添加数据
                tempItemData.enabled = true;
                tempItemData.label = input;
                tempItemData.value = (new Date()).getTime();
                tempSourceData.unshift(tempItemData);
                tempThis.setSourceData(tempSourceData);
                //设置选中数据
                tempThis.setNativeData(tempItemData);
                tempThis.enabled();
            };
        tempThis.disabled();
        setTimeout(tempFunction, 1000);
    }
};
var tempSelector = freeSelect(tempOption);
```
** 如果仍有不清楚的可以参考源码里面的index **