/**
 * 自由选择&搜索 下拉插件
 * Depend on:artTemplate、jQuery||zepto
 * Author PC
 * 待优化情况如下:
 * 1、点击页面其他位置不能关闭列表(ok)
 * 2、没有搜索结果时没有提示(ok)
 * 3、下拉状态和右侧小箭头状态不对应
 * 4、没有唯一ID(ok)
 * 5、样式名称不够特殊
 * 6、不支持键盘事件
 * 7、不支持表单取值(ok)
 * 8、不支持原生select数据来源(ok)
 * 9、不支持禁用选择,包括禁用下拉和禁用选项(ok)
 * 10、添加新选项时不支持异步添加(ok)
 * 备注:
 * 1、3000条数据以下流畅
 * 2、瓶颈在indexOf匹配和生成DOM以及渲染的速度
 */
(function() {
    var freeSelect = function(tempOption) {
        this.inside = {
            doms: {
                select_dom: undefined, //下拉框元素
                wrap_dom: undefined, //整体元素
                hide_dom: undefined, //隐藏块
                list_dom: undefined, //列表
                input_dom: undefined, //输入框
                output_dom: undefined, //输出框
                show_dom: undefined, //显示框
            },
            data: {
                free_select_id: "", //模块ID
                search_text: "", //搜索框内容
                current_data: undefined, //选中数据
            },
            state: {
                hide_dom_show: false, //列表显示状态
                mouse_enter: false, //鼠标位置状态
                selector_enabled: true, //下拉框状态
                input_state: false, //输入状态
                // hover_value: undefined, //焦点值(waiting)
                // current_value: undefined, //选中值(waiting)
            }
        };
        this.tempData = {}; //临时数据
        this.option = tempOption;
        // this.option = {
        //     selector_id: "", //select元素id
        //     source_data: [], //原始数据{value,label,enabled}
        //     show_custom: true, //显示用户自定义选项
        //     default_selected_text:"请选择XXX",//默认显示
        //     change_callback:undefined,//选择回调方法
        //     tips:"没有找到你想要的",//无匹配提示
        //     custom_callback:undefined,//选择自定义回调
        // }
    };
    freeSelect.prototype.init = function() {
        this.checkOption();
        this.createModelMark();

        this.parseElement();
        this.createWrapHTML();
        this.renderWrapDom();
        this.createMatchedHTML();
        this.renderMatchedDom();

        this.bindEvent();
    };
    //检查配置
    freeSelect.prototype.checkOption = function() {
        var tempOption = this.option,
            tempSelectId = tempOption.selector_id;
        this.inside.doms.select_dom = document.getElementById(tempSelectId);
        this.tempData.matched_data = tempOption.source_data;
    };
    //创建模块标记
    freeSelect.prototype.createModelMark = function() {
        var tempRandomNumber = Math.random();
        tempRandomNumber = tempRandomNumber * 100000000000000;
        tempRandomNumber = Math.round(tempRandomNumber);
        this.inside.data.free_select_id = tempRandomNumber;
    };
    //----------------------------DOM操作
    //解析下拉框元素(ok)
    freeSelect.prototype.parseElement = function() {
        var tempSelectDom = this.inside.doms.select_dom,
            tempSourceData = this.option.source_data,
            tempOptionDoms = tempSelectDom.getElementsByTagName('option');
        for (var i = 0; i < tempOptionDoms.length; i++) {
            var tempOption = tempOptionDoms[i],
                tempLabel = tempOption.innerText,
                tempValue = tempOption.getAttribute("value"),
                tempState = tempOption.getAttribute("data-enabled"),
                tempData = {};
            tempData.value = tempValue;
            tempData.label = tempLabel;
            tempData.enabled = tempState === "true" ? true : false;
            tempSourceData.push(tempData);
        }
    };
    //创建包裹元素(ok)
    freeSelect.prototype.createWrapHTML = function() {
        var tempHTML = "",
            tempWrapInfo = {},
            tempInputId = this.option.selector_id,
            tempWrapId = this.inside.data.free_select_id
        tempDefaultText = this.option.default_selected_text;
        tempWrapInfo.free_select_id = tempWrapId;
        tempWrapInfo.selector_id = tempInputId;
        tempWrapInfo.default_selected_text = tempDefaultText;
        tempHTML = template("free_select", tempWrapInfo);
        this.tempData.wrap_HTML = tempHTML;
    };
    //创建匹配元素
    freeSelect.prototype.createMatchedHTML = function() {
        var tempMatchedData = this.tempData.matched_data,
            tempMatchedHTML = [];
        for (var i = 0; i < tempMatchedData.length; i++) {
            var tempItemData = tempMatchedData[i],
                tempItemHTML = template("select_item", tempItemData);
            tempMatchedHTML.push(tempItemHTML);
        }
        tempMatchedHTML = tempMatchedHTML.join("\n");
        this.tempData.matched_HTML = tempMatchedHTML;
    };
    //渲染模块
    freeSelect.prototype.renderWrapDom = function() {
        var tempWrapHTML = this.tempData.wrap_HTML,
            tempSelectDom = this.inside.doms.select_dom,
            tempWrapDom = $(tempWrapHTML),
            tempHideDom = tempWrapDom.find(".hide_wrap"),
            tempListDom = tempHideDom.find(".list"),
            tempInuputDom = tempWrapDom.find(".search_input"),
            tempOutputDom = tempWrapDom.find(".value_output"),
            tempShowDom = tempWrapDom.find(".selected_label");
        tempSelectDom = $(tempSelectDom);
        this.inside.doms.wrap_dom = tempWrapDom;
        this.inside.doms.hide_dom = tempHideDom;
        this.inside.doms.list_dom = tempListDom;
        this.inside.doms.input_dom = tempInuputDom;
        this.inside.doms.output_dom = tempOutputDom;
        this.inside.doms.show_dom = tempShowDom;
        tempSelectDom.replaceWith(tempWrapDom);
    };
    //渲染选项
    freeSelect.prototype.renderMatchedDom = function() {
        var tempMatchedHTML = this.tempData.matched_HTML,
            tempListDom = this.inside.doms.list_dom;
        tempListDom.html(tempMatchedHTML);
    };
    //重置选中(waiting)
    freeSelect.prototype.resetValue = function() {
        this.setNativeData();
        //this.resetSearchInput();
    };
    //渲染选中选项
    freeSelect.prototype.renderCurrentData = function() {
        var tempShowDom = this.inside.doms.show_dom,
            tempOutputDom = this.inside.doms.output_dom,
            tempCurrentData = this.inside.data.current_data,
            tempLabel, tempValue;
        if (tempCurrentData === undefined) {
            tempValue = "";
            tempLabel = this.option.default_selected_text;
        } else {
            tempValue = tempCurrentData.value;
            tempLabel = tempCurrentData.label;
        }
        tempShowDom.text(tempLabel);
        tempOutputDom.val(tempValue);
    };
    //重置输入
    freeSelect.prototype.resetSearchInput = function() {
        var tempInuputDom = this.inside.doms.input_dom,
            tempSourceData = this.option.source_data;
        this.tempData.matched_data = tempSourceData;
        this.inside.data.search_text = "";
        tempInuputDom.val("");
        this.createMatchedHTML();
        this.renderMatchedDom();
    };
    //禁用模块
    freeSelect.prototype.disabled = function() {
        var tempWrapDom = this.inside.doms.wrap_dom,
            tempNowState = this.inside.state.selector_enabled;
        if (tempNowState) {
            this.inside.state.selector_enabled = false;
            tempWrapDom.addClass("disabled");
            this.unBindEvent();
        }
    };
    //开启模块
    freeSelect.prototype.enabled = function() {
        var tempWrapDom = this.inside.doms.wrap_dom,
            tempNowState = this.inside.state.selector_enabled;
        if (tempNowState) {

        } else {
            this.inside.state.selector_enabled = true;
            tempWrapDom.removeClass("disabled");
            this.bindEvent();
        }
    };
    //显示隐藏区域
    freeSelect.prototype.showHideDom = function(e) {
        var tempInuputDom = this.inside.doms.input_dom,
            tempHideDom = this.inside.doms.hide_dom;
        this.inside.state.hide_dom_show = true;
        tempHideDom.addClass("show");
        tempInuputDom.focus();
    };
    //隐藏隐藏区域
    freeSelect.prototype.hideHideDom = function(e) {
        var tempHideDom = this.inside.doms.hide_dom;
        this.inside.state.hide_dom_show = false;
        tempHideDom.removeClass("show");
    };
    //input keyup句柄
    freeSelect.prototype.inputKeyUpEvent = function(e) {
        var tempThis = e.target,
            tempValue = tempThis.value;
        this.inside.state.input_state = false;
        this.inside.data.search_text = tempValue;
        this.matchedInputText(); //查找匹配数据
        this.customMatched(); //添加自定义选项
        this.createMatchedHTML(); //创建匹配元素
        this.renderMatchedDom(); //渲染选项
    };
    //input keydown句柄
    freeSelect.prototype.inputKeyDownEvent = function(e) {
        this.inside.state.input_state = true;
    };
    //绑定事件
    freeSelect.prototype.bindEvent = function() {
        var tempThis = this,
            tempWrapDom = this.inside.doms.wrap_dom,
            tempHideDom = this.inside.doms.hide_dom,
            tempListDom = this.inside.doms.list_dom,
            tempInuputDom = this.inside.doms.input_dom,
            tempShowDom = this.inside.doms.show_dom;
        tempShowDom.on("click", function(e) { //显示和隐藏区域
            var tempHideDomShow = tempThis.inside.state.hide_dom_show;
            if (tempHideDomShow) {
                tempThis.hideHideDom();
            } else {
                tempThis.showHideDom();
            }
        });
        tempListDom.on("click", function(e) { //选中选项
            var tempTarget = e.target;
            tempTarget = $(tempTarget);
            var tempValue = tempTarget.attr("data-value"),
                tempState = tempTarget.attr("data-state");
            if (tempState == "enabled") {
                tempThis.setValue(tempValue);
            } else {
                tempInuputDom.focus();
            }
        });
        tempInuputDom.on("blur", function(e) { //失去焦点
            var tempMouseState = tempThis.inside.state.mouse_enter;
            if (tempMouseState) {

            } else {
                tempThis.hideHideDom();
            }
        });
        tempInuputDom.on("keyup", function(e) { //更新输入状态
            var tempClock = window.setTimeout(function() {
                tempThis.inputKeyUpEvent(e);
            }, 350);
            tempThis.tempData.search_clock = tempClock;
        });
        tempInuputDom.on("keydown", function(e) { //更新输入状态
            tempThis.inputKeyDownEvent(e);
            var tempClock = tempThis.tempData.search_clock;
            if (tempClock === undefined) {

            } else {
                window.clearTimeout(tempClock);
            }
        });
        tempWrapDom.on("mouseover", function(e) { //更新鼠标状态
            tempThis.inside.state.mouse_enter = true;
        });
        tempWrapDom.on("mouseout", function(e) { //更新鼠标状态
            tempThis.inside.state.mouse_enter = false;
        });
    };
    //解绑事件
    freeSelect.prototype.unBindEvent = function() {
        var tempWrapDom = this.inside.doms.wrap_dom,
            tempListDom = this.inside.doms.list_dom,
            tempInuputDom = this.inside.doms.input_dom,
            tempShowDom = this.inside.doms.show_dom;
        tempListDom.off();
        tempShowDom.off();
        tempInuputDom.off();
        tempWrapDom.off();
    };

    //----------------------------数据操作
    //字符串检测
    freeSelect.prototype.checkString = function(inputString) {
        var tempString = inputString.trim(),
            tempSize = tempString.length,
            tempResult = false;
        if (tempSize > 0) {
            tempResult = true;
        }
        return tempResult;
    };
    //数据复制
    freeSelect.prototype.cloneData = function(inputData) {
        var tempCloneData = JSON.stringify(inputData);
        tempCloneData = JSON.parse(tempCloneData);
        return tempCloneData;
    };
    //数据合并
    freeSelect.prototype.mergeData = function(inputData_1, inputData_2) {
        var tempResult = inputData_2;
        for (var i in inputData_1) {
            var tempValue = inputData_1[i];
            tempResult[i] = tempValue;
        }
        return tempResult;
    };
    //设置选中数据
    freeSelect.prototype.setValue = function(inputValue) {
        var tempSearchText = this.inside.data.search_text,
            tempSearchTextBoolean = this.checkString(tempSearchText),
            tempData = this.searchFromSourceData(inputValue),
            tempCustomFunction = this.option.custom_callback,
            tempIsFunction = tempCustomFunction instanceof Function;
        if (tempData === undefined) {
            if (tempIsFunction && tempSearchTextBoolean) {
                tempCustomFunction.call(this, tempSearchText);
            }
        } else {
            this.setNativeData(tempData);
        }
        this.hideHideDom();
        this.resetSearchInput();
    };
    //获取选中数据
    freeSelect.prototype.getValue = function() {
        var tempData = this.inside.data.current_data;
        return tempData;
    };
    //设置本地数据
    freeSelect.prototype.setNativeData = function(inputData) {
        var tempFunction = this.option.change_callback,
            tempIsFunction = tempFunction instanceof Function;
        this.inside.data.current_data = inputData;
        this.renderCurrentData();
        if (tempIsFunction) {
            tempFunction.call(this, inputData);
        }
    };
    //数据匹配(可以使用searchFromSourceData方法)
    freeSelect.prototype.matchedInputText = function() {
        var tempText = this.inside.data.search_text,
            tempSourceData = this.option.source_data,
            tempResult = [];
        tempText = tempText.toUpperCase();
        for (var i = 0; i < tempSourceData.length; i++) {
            var tempItem = tempSourceData[i],
                tempItemText = tempItem.label,
                tempIndex = -1;
            tempItemText = tempItemText.toUpperCase();
            tempIndex = tempItemText.indexOf(tempText);
            if (tempIndex > -1) {
                tempResult.push(tempItem);
            }
        }
        this.tempData.matched_data = tempResult;
    };
    //查找数据
    freeSelect.prototype.searchFromSourceData = function(inputValue) {
        var tempSourceData = this.option.source_data,
            tempResult;
        loop: for (var i = 0; i < tempSourceData.length; i++) {
            var tempItemData = tempSourceData[i],
                tempValue = tempItemData.value;
            if (tempValue == inputValue) {
                tempResult = tempItemData;
                break loop;
            }
        }
        return tempResult;
    };
    //添加提示或自定义选项
    freeSelect.prototype.customMatched = function() {
        var tempMatchedData = this.tempData.matched_data,
            tempShowCustomState = this.option.show_custom,
            tempTips = this.option.tips,
            tempSearchText = this.inside.data.search_text,
            tempCustomData = {};
        if (tempMatchedData.length === 0) {
            if (tempShowCustomState) {
                tempCustomData.enabled = true;
                tempCustomData.label = tempSearchText;
            } else {
                tempCustomData.label = tempTips;
                tempCustomData.value = tempTips;
                tempCustomData.enabled = false;
            }
            tempMatchedData.push(tempCustomData);
        }
    };
    //设置源数据
    freeSelect.prototype.setSourceData = function(inputSourceData) {
        this.option.source_data = inputSourceData;
        this.tempData.matched_data = inputSourceData;
        this.createMatchedHTML();
        this.renderMatchedDom();
    };
    //获取源数据
    freeSelect.prototype.getSourceData = function() {
        var tempSourceData = this.option.source_data;
        return tempSourceData;
    };
    window.freeSelect = function(inputOption) {
        var tempSelector = new freeSelect(inputOption);
        tempSelector.init();
        return tempSelector;
    }
})();
