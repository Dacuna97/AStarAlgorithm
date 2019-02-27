"use strict"

//const topp = 0;
const parent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;

class PriorityQueue {
    constructor(comparator = (a, b) => a.cost < b.cost) {
        this._heap = [];
        this._comparator = comparator;
    }
    size() {
        return this._heap.length;
    }
    isEmpty() {
        return this.size() == 0;
    }
    contains(value) {
        return this._heap.indexOf(value) !== -1;
    }
    peek() {
        return this._heap[0];
    }
    push(value) {
        this._heap.push(value);
        this._siftUp();
        return this.size();
    }
    pop() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > 0) {
            this._swap(0, bottom);
        }
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }
    replace(value) {
        const replacedValue = this.peek();
        this._heap[0] = value;
        this._siftDown();
        return replacedValue;
    }
    _greater(i, j) {
        return this._comparator(this._heap[i], this._heap[j]);
    }
    _swap(i, j) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }
    _siftUp() {
        let node = this.size() - 1;
        while (node > 0 && this._greater(node, parent(node))) {
            this._swap(node, parent(node));
            node = parent(node);
        }
    }
    _siftDown() {
        let node = 0;
        while (
            (left(node) < this.size() && this._greater(left(node), node)) ||
            (right(node) < this.size() && this._greater(right(node), node))
        ) {
            let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
}


/*contains(point) {
    let contain = false;
    this.items.forEach(elem => {
        if (elem.element.x === point.x && elem.element.y === point.y) {
            contain = true;
        }
    });
    return contain;
}*/


var ObjectsEnum = {
    EMPTY: 0,
    OBSTACLE: 1,
    START: 2,
    FINISH: 3
};
class Node {
    constructor(_x, _y, obstacle) {
        this.x = _x;
        this.y = _y;
        this.obstacle = obstacle;
        this.cost = 0;

    }
    setCost(_cost) {
        this.cost += _cost;
    }
    setDistance(_distance) {
        this.distance = _distance;
    }
    setBefore(_before) {
        this.before = _before;
    }
};
class Table {
    constructor(_rows, _columns) {
        this.reset(_rows, _columns);
    }
    reset(_rows, _columns, start, finish) {
        this.rows = _rows;
        this.columns = _columns;
        this.matrix = Array(this.columns).fill().map(element => Array(this.rows).fill(undefined));
        this.obstacles = [];
        this.waypoints = [];
        this.penalizations = [];
        this.fillMatrix();
    }
    setStart(start) {
        this.start = new Node(start.x, start.y, false);
        this.matrix[this.start.x][this.start.y] = ObjectsEnum.START;
    }
    setFinish(finish) {
        this.finish = new Node(finish.x, finish.y, false);
        this.matrix[this.finish.x][this.finish.y] = ObjectsEnum.FINISH;
    }
    fillMatrix() {
        for (let i = 0; i < this.columns; ++i) {
            for (let j = 0; j < this.rows; ++j) {
                this.matrix[i][j] = ObjectsEnum.EMPTY;
            }
        }
        //recorremos array de obstacles y cambiamos posiciones

    }
    show() {
        let line;
        for (let i = 0; i < this.columns; ++i) {
            line = "";
            for (let j = 0; j < this.rows; ++j) {
                line += this.matrix[i][j];
            }
            console.log(line);
        }
    }
    setObstacle(x, y) {
        this.matrix[x][y] = ObjectsEnum.OBSTACLE;
        this.obstacles.push(new Node(x, y, true));
    }
    setWayPoint(x, y) {
        this.waypoints.push(new Node(x, y, false));
    }
    setPenalization(x, y, val) {
        let node = new Node(x, y, false);
        node.setCost(val);
        this.penalizations.push(node);
    }
};
class Astar {
    constructor(_table, start, finish) {
        this.table = _table;
        this.start = start;
        this.finish = finish;
        this.matrix = _table.matrix;
        this.columns = _table.columns;
        this.rows = _table.rows;
        this.closed = [];
        _table.obstacles.forEach(element => {
            this.closed.push(element);
        })
        this.open = new PriorityQueue();
    }
    solve() {
        //we always add first the node where we start from start to close
        this.start.setDistance(0);
        let val = this.start.distance + this.calculateAverageDistanceToEnd(this.start);
        this.start.setCost(val);
        this.start.setBefore(null);
        this.open.push(this.start);

        while (!this.contains(this.closed, this.finish).found) {
            let node = this.open.pop();
            this.closed.push(node);
            if (node === undefined) {
                alert("NO SE PUEDE LLEGAR");
            } else {
                let neighbors = this.neighbors(node);
                neighbors.forEach((element) => {
                    if (!this.contains(this.closed, element).found) {
                        val = element.distance + this.calculateAverageDistanceToEnd(element);
                        let contains_penal = this.contains(this.table.penalizations, element);
                        if (contains_penal.found) {
                            val += this.table.penalizations[contains_penal.index].cost;
                        }
                        if (!this.open.contains(element)) {
                            element.setCost(val);
                            this.open.push(element);
                        } else {
                            if (val < element.cost) {
                                element.setCost(val);
                                this.open.replace(element);
                            }
                        }
                    }
                });
            }
        }

    }
    path() {
        let nodofinal = this.closed[this.closed.length - 1];
        let camino = [];
        while (nodofinal.before !== null) {
            let p = {
                x: nodofinal.x,
                y: nodofinal.y,
                before: nodofinal.before
            };
            camino.push(p);
            nodofinal = nodofinal.before;
        }
        camino.reverse();
        return camino;

    }
    reset() {
        this.table = undefined;
        this.start = undefined;
        this.finish = undefined;
        this.matrix = undefined;
        this.columns = undefined;
        this.rows = undefined;
        this.closed = undefined;
        this.open = undefined;
    }
    contains(array, point) {
        let contain = {
            found: false,
            index: 0
        }
        array.forEach((element, index) => {
            if (element.x === point.x && element.y === point.y) {
                contain.found = true;
                contain.index = index;
            }
        });
        return contain;
    }

    calculateAverageDistanceToEnd(point) {
        return Math.sqrt((Math.pow((point.x - this.table.finish.x), 2)) + (Math.pow((point.y - this.table.finish.y), 2)));
    }
    neighbors(point) {
        let neighbors = [];
        //up
        if (point.x - 1 >= 0 && (this.matrix[point.x - 1][point.y] === ObjectsEnum.EMPTY || this.matrix[point.x - 1][point.y] === ObjectsEnum.FINISH)) {
            let p = new Node(point.x - 1, point.y, false);
            p.setDistance(point.distance + 1);
            p.setBefore(point);
            neighbors.push(p);
        }
        //down
        if (point.x + 1 < this.rows && (this.matrix[point.x + 1][point.y] === ObjectsEnum.EMPTY || this.matrix[point.x + 1][point.y] === ObjectsEnum.FINISH)) {
            let p = new Node(point.x + 1, point.y, false);
            p.setDistance(point.distance + 1);
            p.setBefore(point);
            neighbors.push(p);
        }
        //right
        if (point.y + 1 < this.columns && (this.matrix[point.x][point.y + 1] === ObjectsEnum.EMPTY || this.matrix[point.x][point.y + 1] === ObjectsEnum.FINISH)) {
            let p = new Node(point.x, point.y + 1, false);
            p.setDistance(point.distance + 1);
            p.setBefore(point);
            neighbors.push(p);
        }
        //left
        if (point.y - 1 >= 0 && (this.matrix[point.x][point.y - 1] === ObjectsEnum.EMPTY || this.matrix[point.x][point.y - 1] === ObjectsEnum.FINISH)) {
            let p = new Node(point.x, point.y - 1, false);
            p.setDistance(point.distance + 1);
            p.setBefore(point);
            neighbors.push(p);
        }
        //up right
        if (point.y + 1 < this.columns && point.x - 1 >= 0 && (this.matrix[point.x - 1][point.y + 1] === ObjectsEnum.EMPTY || this.matrix[point.x - 1][point.y + 1] === ObjectsEnum.FINISH)) {
            let p = new Node(point.x - 1, point.y + 1, false);
            p.setDistance(point.distance + Math.sqrt(2));
            p.setBefore(point);
            neighbors.push(p);
        }
        //up left
        if (point.y - 1 >= 0 && point.x - 1 >= 0 && (this.matrix[point.x - 1][point.y - 1] === ObjectsEnum.EMPTY || this.matrix[point.x - 1][point.y - 1] === ObjectsEnum.FINISH)) {
            let p = new Node(point.x - 1, point.y - 1, false);
            p.setDistance(point.distance + Math.sqrt(2));
            p.setBefore(point);
            neighbors.push(p);
        }
        //down right
        if (point.y + 1 < this.columns && point.x + 1 < this.rows && (this.matrix[point.x + 1][point.y + 1] === ObjectsEnum.EMPTY || this.matrix[point.x + 1][point.y + 1] === ObjectsEnum.FINISH)) {
            let p = new Node(point.x + 1, point.y + 1, false);
            p.setDistance(point.distance + Math.sqrt(2));
            p.setBefore(point);
            neighbors.push(p);
        }
        //down left
        if (point.y - 1 >= 0 && point.x + 1 < this.rows && (this.matrix[point.x + 1][point.y - 1] === ObjectsEnum.EMPTY || this.matrix[point.x + 1][point.y - 1] === ObjectsEnum.FINISH)) {
            let p = new Node(point.x + 1, point.y - 1, false);
            p.setDistance(point.distance + Math.sqrt(2));
            p.setBefore(point);
            neighbors.push(p);
        }

        return neighbors;
    }
};

function drawTable(t) {
    let matriz = t.matrix;
    let new_matrix = $("<table></table>");
    matriz.forEach((row, index1) => {
        let tr = $("<tr></tr>");
        row.forEach((element, index2) => {
            let new_elem = $("<td></td>");
            let index = index1 * (t.columns) + index2;
            new_elem.attr("id", index);
            tr.append(new_elem);
        })
        new_matrix.append(tr);
    });
    return new_matrix;
};

function insertTable(selector, matriz) {
    $(selector + ">table").remove();
    $(selector).append(matriz);

};

function paintPath(point, columns) {

    let index = point.x * (columns) + point.y;
    console.log(point.x + " " + point.y);
    if (point.before) {
        let index_before = point.before.x * (columns) + point.before.y;
        $("#" + index_before).css("background-image", "");
        $("#" + index_before).css("background-color", "white");
    }
    $("#" + index).css("background-image", 'url("plane.png")');
    $("#" + index).css("background-position", "center");
    $("#" + index).css("background-repeat", "no-repeat");
    $("#" + index).css("background-size", "cover");
};

function drawPath(camino, columns) {
    let contador = 0;
    let interval = setInterval(() => {
        if (contador < camino.length) {
            paintPath(camino[contador], columns);
            ++contador;
        } else {
            clearInterval(interval);
        }
    }, 1000);
}

$(() => {
    var t = new Table(10, 10);
    var matriz = drawTable(t);
    var clicks = 0;
    var state = "";
    insertTable(".tabla", matriz);
    $(".items").on("click", (item) => {
        state = $(item.target).text();
    });
    $("table").on("click", "td", (event) => {
        let elementoPulsado = $(event.target);
        let cell = parseInt(elementoPulsado.attr("id"));
        let x = (cell / t.columns);
        x = Math.floor(x);
        let y = cell % t.columns;
        if (state === "start") {
            t.setStart({
                x: x,
                y: y
            });
            t.setWayPoint(x, y);
            elementoPulsado.css("background-color", "lightblue");
        } else if (state === "end") {
            while (x === t.start.x && y === t.start.y) {
                let elementoPulsado = $(event.target);
                let cell = parseInt(elementoPulsado.attr("id"));
                x = (cell / t.columns);
                x = Math.floor(x);
                y = cell % t.columns;
                clicks = 1;
            }
            if (t.finish === undefined) {
                t.setFinish({
                    x: x,
                    y: y
                });
                elementoPulsado.css("background-color", "green");
            }

        } else if (state === "obstacle") {
            t.setObstacle(x, y);
            elementoPulsado.css("background-color", "red");
        } else if (state === "waypoint") {
            t.setWayPoint(x, y);
            elementoPulsado.css("background-color", "yellow");
        } else {
            let value = parseInt(elementoPulsado.text());
            if (value) {
                value++;
            } else {
                value = 1;
            }
            console.log(elementoPulsado.text(value.toString()));
            elementoPulsado.css("background-color", "orange");
            t.setPenalization(x, y, value);
        }
    });
    var final_path = [];
    $("#start").on("click", (event) => {
        let i = 0;
        if (i === 0) {
            t.setWayPoint(t.finish.x, t.finish.y);
        }
        while (i < t.waypoints.length - 1) {
            let start = t.waypoints[i];
            let finish = t.waypoints[i + 1];
            let algorithm = new Astar(t, start, finish);
            algorithm.solve();
            if (final_path.length === 0) {
                final_path = algorithm.path();
            } else {
                algorithm.path().forEach(element => {
                    final_path.push(element);
                });
            }
            i++;
        }
        drawPath(final_path, t.columns);

    });

});