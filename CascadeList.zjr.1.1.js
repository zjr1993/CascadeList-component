function _extend(target, source) {
    for (let key of Object.keys(source)) {
        if (target.hasOwnProperty(key) && typeof target[key] === "object") {
            extend(target[key], source[key])
        }
        else {
            target[key] = source[key];
        }
    }
    return target;
}

function extend(target, source) {
    if (source === null || source === undefined
        || (Object.keys(source).length === 0 && source.constructor === Object)
        || typeof source === "number" || typeof source === "string") {
        return target;
    }
    else if (target === null || target === undefined) {
        return source;
    }
    else {
        return _extend(target, source);
    }
}

function $(className, type = 'div') {
    let node = document.createElement(type);
    node.className = className;
    return node;
}

class CascadeList {
    constructor(data, options) {
        const cfg = {
            color: {
                backgroundColor: "#ddeef275",
                color: "black",

                // color of header
                tab_bg: "#ddeef275",
                tab_color: "black",

                // Dropdown menu color
                panel_bg: "#ddeef275",
                panel_color: "black",

                // The color of the line where the mouse is hovering
                item_fs_color: "red", item_fs_bg: "darkblue",
                item_bg: "#ffca5e96", item_color: "black"
            }, width: 320, height: 350, fontSize: 16,
            id: "cascader", tab_fontSize: 0.8, panel_fontSize: 0.6
        }
        this.id = "cascader";
        this.hook = () => { };
        this.node = null;

        extend(this, cfg);
        extend(this, options);

        this.Cascader = new TreeList("please select");
        this.Cascader.insertMultiArray(data);
        this.Cascader.record();
        this.svgNext =
            `<svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke-width="1.5">
            <g id="group-0" stroke="#757575" fill="#757575">
                <path d="M6.75 4.24994L10.2436 7.99321C10.2472 7.99705 10.2472 8.00301 10.2436 8.00685L6.75 11.7499" stroke-linecap="round" stroke-linejoin="miter" fill="none" vector-effect="non-scaling-stroke">
                </path>
            </g>
        </svg>`;
        this.draw();
    }
    draw() {
        const id = this.id;
        this.node = $(`${id}__container`);   // container
        this.node.style.setProperty('--var-font-size', `${this.fontSize}px`);
        this.node.style.setProperty('--var-width', `${this.width}px`);
        this.node.style.setProperty('--var-height', `${this.height}px`);
        this.node.style.setProperty('--var-fs-color', `${this.color.item_fs_color}`);
        this.node.style.setProperty('--var-fs-bg', `${this.color.item_fs_bg}`);
        this.node.style.setProperty('--var-item-bg', `${this.color.item_bg}`);
        this.node.style.setProperty('--var-item-color', `${this.color.item_color}`);
        this.node.style.setProperty('position', 'absolute');
        this.node.style.setProperty('left', '0px');
        this.node.style.setProperty('top', '0px');
        this.node.style.setProperty('z-index', 100);


        let context = $(`${id}__context`);      // component
        context.style.backgroundColor = this.color.backgroundColor;
        context.style.color = this.color.color;
        let component = $(`${id}__component`);  // menu-content
        let menu = $(`${id}__menu`);            // menu-panel-content
        let menu_container = $(`${id}__menu_container`); // cascader-content 1
        let menu_context = $(`${id}__menu_context`);    //cascader-tabs 1
        this.tabs = $(`${id}__tabs`);       //  tabs_name_list
        this.content = $(`${id}__content`); //  tabs_pane_container

        this.tabs.style.backgroundColor = this.color.tab_bg;
        this.tabs.style.color = this.color.tab_color;
        this.tabs.style.fontSize = `${this.tab_fontSize}em`;

        this.content.style.backgroundColor = this.color.panel_bg;
        this.content.style.color = this.color.panel_color;
        this.content.style.fontSize = `${this.panel_fontSize}em`;

        this.node.append(context);
        context.append(component);
        component.append(menu);
        menu.append(menu_container);
        menu_container.append(menu_context);
        menu_context.appendChild(this.tabs);
        menu_context.appendChild(this.content);
    }

    createItem(field, index, isSelected) {
        let item = $("cascader-select-list-item");
        if (isSelected == field) item.classList.add('selected');
        let span = $("cascader-select-list-item-label", 'span');
        span.dataset.index = index;
        span.textContent = field;
        item.appendChild(span);
        let proNewNode = this.Cascader.next(field);
        if ( ! proNewNode.isEndNode()) {
            let ii = $(`cascader-select-icon`, 'i');
            ii.innerHTML = this.svgNext;
            item.appendChild(ii);
        }
        return item;
    }

    updatePanel() {
        let items = this.Cascader.getChildrenID();
        this.content.innerHTML =
            '<div class="cascader-tab-pane hidden"></div>'.repeat(this.Cascader.walk);

        let tabPane = $(`cascader-tab-pane`);
        let cascaderList = $(`cascader-select-list`);

        for (let j = 0; j < items.length; j++) {
            cascaderList.appendChild(this.createItem(items[j], j));
        }
        this.content.appendChild(tabPane);
        tabPane.appendChild(cascaderList);
        this.content.style.marginLeft = `-${this.Cascader.walk * 100}%`;
        cascaderList.addEventListener('click', (event) => {
            let target = event.target;
            if (target != cascaderList) {
                if (target.nodeName != "DIV"){
                    let tmp = target.offsetParent;
                    while (tmp === undefined){
                        target = target.parentNode;
                        tmp = target.offsetParent;
                    }
                    target = tmp;
                }
                if (this.Cascader.isEndNode()) {
                    // when the drag_down menu is activated again
                    this.Cascader = this.Cascader.back();
                }
                this.Cascader = this.Cascader.right[target.firstChild.dataset.index];
                this.Cascader.record();
                if (this.Cascader.isEndNode()) {
                    // handle selected
                    let select = cascaderList.querySelector('.cascader-select-list-item.selected');
                    if (select) select.classList.remove('selected');
                    target.classList.add('selected');

                    let path = TreeList.toString(TreeList.path);
                    path.shift();
                    this.updateHeaders();
                    this.hook(path);
                }
                else {
                    event.stopPropagation();
                    this.show();
                }
            }
        });
    }

    updateHeaders() {
        let headers = TreeList.toString(TreeList.path);
        let nameTabs = $("cascader-name-tabs");
        let nameSlider = $("cascader-name-slider");
        this.tabs.innerHTML = "";
        this.tabs.appendChild(nameTabs);
        this.tabs.appendChild(nameSlider);

        !this.Cascader.isEndNode() && headers.push(headers[0]);
        headers.shift();
        let html = "";
        for (let k = 0; k < headers.length - 1; k++) {
            html = html + `<div class="tab-cascader-name" role="tab"><span class="name-cascader-tab-label">${headers[k]}</span></div>`;
        }
        html = html +
            `<div class="tab-cascader-name selected" role="tab"><span class="name-cascader-tab-label">${headers.at(-1)}</span></div>`;
        nameTabs.innerHTML = html;
        let domRect = nameTabs.lastChild.getBoundingClientRect();
        nameSlider.style.width = `${domRect.right - domRect.left}px`;
        nameSlider.style.marginLeft = `${nameTabs.lastChild.offsetLeft}px`;
        let labels = nameTabs.childNodes;
        let tabs = this.content.childNodes;
        let proSelected = labels.length - 1;

        for (let i = 0; i < labels.length; i++) {
            let label = labels[i];
            label.addEventListener('click', () => {
                if (!label.classList.contains('selected')) {
                    label.classList.add('selected');
                    labels[proSelected].classList.remove('selected');
                    tabs[proSelected].classList.add('hidden');
                    tabs[proSelected].innerHTML = '';
                    proSelected = i;
                    let tabPane = tabs[i];
                    tabPane.classList.remove('hidden');
                    this.content.style.marginLeft = `-${i * 100}%`;
                    let domRect = label.getBoundingClientRect();
                    nameSlider.style.width = `${domRect.right - domRect.left}px`;
                    nameSlider.style.marginLeft = `${label.offsetLeft}px`;

                    this.Cascader = TreeList.nth(i);
                    let items = this.Cascader.getChildrenID();

                    let cascaderList = $("cascader-select-list");
                    let alreadySelected = undefined;
                    if (TreeList.path.length > this.Cascader.walk + 1) {
                        alreadySelected = TreeList.path[this.Cascader.walk + 1].getId();
                    }

                    for (let j = 0; j < items.length; j++) {
                        cascaderList.appendChild(this.createItem(items[j], j, alreadySelected));
                    }
                    tabPane.appendChild(cascaderList);
                    cascaderList.addEventListener('click', (event) => {
                        let target = event.target;
                        if (target != cascaderList) {
                            if (target.nodeName != "DIV"){
                                let tmp = target.offsetParent;
                                while (tmp === undefined){
                                    target = target.parentNode;
                                    tmp = target.offsetParent;
                                }
                                target = tmp;
                            }
                            if (this.Cascader.isEndNode()) {
                                // when the drag_down menu is activated again
                                this.Cascader = this.Cascader.back();
                            }
                            this.Cascader = this.Cascader.right[target.firstChild.dataset.index];
                            this.Cascader.record();
                            if (this.Cascader.isEndNode()) {
                                // handle selected
                                let select = cascaderList.querySelector('.cascader-select-list-item.selected');
                                if (select) select.classList.remove('selected');
                                target.classList.add('selected');

                                let path = TreeList.toString(TreeList.path);
                                path.shift();
                                this.updateHeaders();
                                this.hook(path);
                            }
                            else {
                                event.stopPropagation();
                                this.show();
                            }
                        }
                    });
                }
            });
        }
    }

    show() {
        this.updatePanel();
        this.updateHeaders();
    }
}