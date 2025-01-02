class TreeList {
    #identity;
    constructor(identity, value) {
        this.#identity = identity;
        this.value = value;
        this.left = null;
        this.right = null;
        this.walk = 0;
    }

    getId() {
        return this.#identity;
    }

    getChildren() {
        if (this.right === null) return [];
        return this.right;
    }

    next(id) {
        if (this.right === null) return null;
        for (let i = 0; i < this.right.length; i++) {
            if (this.right[i].getId() === id) return this.right[i];
        }
        return null;
    }

    back() {
        return this.left;
    }

    currentPath() {
        let path = [this];
        let that = this;
        while ((that = that.left)) {
            path.unshift(that);
        }
        return path;
    }

    getRoot() {
        let node = this;
        while (node.left) {
            node = node.left;
        }
        return node;
    }

    print() {
        console.log(this.currentPath().map(node => node.getId()).join('->'));
        if (this.right === null) return;
        for (let i = 0; i < this.right.length; i++) {
            this.right[i].print();
        }
    }

    treePrint(offset = 0) {
        console.log('|');
        console.log('|' + `-->`.repeat(this.walk - offset) + `${this.#identity}`);
        if (this.right === null) return;
        for (let i = 0; i < this.right.length; i++) {
            this.right[i].treePrint(offset);
        }
    }

    searchId(id) {
        if (this.#identity === id) {
            return this;
        } else {
            if (this.right === null) return null;
            for (let j = 0; j < this.right.length; j++) {
                let node = this.right[j].searchId(id);
                if (node !== null) return node;
            }
            return null;
        }
    }

    findPath(path) {
        if (path.length === 0) return this;
        if (this.right === null) return null;
        for (let i = 0; i < this.right.length; i++) {
            if (this.right[i].getId() === path[0]) {
                let node = this.right[i];
                path.shift();
                return node.findPath(path);
            }
        }
        return null;
    }

    insertNode(node) {
        if (this.right === null) {
            this.right = [node];
        } else {
            for (let j = 0; j < this.right.length; j++) {
                if (this.right[j].getId() === node.getId()) {
                    if (node.right === null) return;
                    for (let k = 0; k < node.right.length; k++) {
                        this.right[j].insertNode(node.right[k]);
                    }
                    return;
                }
            }
            this.right.push(node);
        }
        node.left = this;
        node.walk = this.walk + 1;
    }

    addChild(id, value) {
        if (this.right === null) {
            this.right = [];
        } else {
            for (let i = 0; i < this.right.length; i++) {
                if (this.right[i].getId() === id) {
                    return this.right[i];
                }
            }
        }
        let node = new TreeList(id, value);
        node.left = this;
        node.walk = this.walk + 1;
        this.right.push(node);
        return node;
    }

    insertPath(path) {
        if (path.length === 0) return;
        let node = this.addChild(path[0]);
        path.shift();
        node.insertPath(path);
    }

    insertNestedArray(array) {
        if (array.length === 0) return;
        let that = this;
        for (let i = 0; i < array.length; i++) {
            if (Array.isArray(array[i])) {
                that.insertNestedArray(array[i]);
            } else {
                that = this.addChild(array[i]);
            }
        }
    }

    insertMultiArray(array) {
        if (array.length === 0) return;
        for (let j = 0; j < array.length; j++) {
            if (Array.isArray(array[j])) {
                this.insertPath(array[j]);
            }
        }
    }

    insertCascader(array) {
        if (array.length === 0) return;
        for (let i = 0; i < array[0].length; i++) {
            this.addChild(array[0][i]).insertCascader(array.slice(1));
        }
    }

    getChildrenID() {
        return TreeList.toString(this.getChildren());
    }

    record() {
        TreeList.path = this.currentPath();
    }

    isEndNode() {
        return this.right === null;
    }

    static nth(n) {
        if (TreeList.hasOwnProperty('path') && Array.isArray(TreeList.path)) return TreeList.path[n];
    }

    static toString(nodes) {
        let id_list = [];
        nodes.forEach((element, i) => {
            id_list[i] = element.getId();
        });
        return id_list;
    }
}