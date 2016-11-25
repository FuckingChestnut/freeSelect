# freeSelect
select&amp;search&amp;interaction&amp;test
## 插件整理尚未完成
1. 使用
'<script type="text/javascript">
    var tempOption = {
        selector_id: "select",//模块ID
        source_data: [],//源数据
        show_custom: true,//是否显示可添加
        request_data:{},//其他请求数据
        connect_name:"",//新增字段名
        tips: "没有找到你想要的",//无匹配提示
        default_selected_text: "请选择",//默认显示文字
        change_callback: function(input) {//选择已存在选项回调
            console.log(input);
        },
        custom_callback:function (input) {//选择自定义选项回调
            var tempThis = this,
                tempFunction = function () {
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
            setTimeout(tempFunction,1000);
        }
    };
    var tempSelector = freeSelect(tempOption);
    </script>'
2. 配置