(function (win) {
    /**
    * author:modanzuo@sina.con
    */
    var gravity = 9.8;//加速度
    var radius = 10; //半径
    var rebound = 0.8; //反弹系数
    var coefficient_random_x = 15;  //脱离时随机系数
    var coefficient_random_y = 50;  //脱离时随机系数
    var width = 1200;  //canvas宽度
    var height = 200;  //canvas高度
    var point_number = 200;  //点的总数
    var distance = 22; //数字内间距
    var number_distance = 20; //数字间距
    var number_data = {  //数据模型
        "0": "01110-10001-10001-10001-10001-10001-01110", //0
        "1": "00100-11100-00100-00100-00100-00100-11111", //1
        "2": "01110-10001-00001-00010-00100-01000-11111", //2
        "3": "01110-10001-00001-01110-00001-10001-01110", //3
        "4": "00010-00110-01010-10010-11111-00010-00010", //4
        "5": "11111-10000-10000-11110-00001-00001-11110", //5
        "6": "01110-10001-10000-11110-10001-10001-01110", //6
        "7": "11111-10001-00010-00100-00100-00100-00100", //7
        "8": "01110-10001-10001-01110-10001-10001-01110", //8
        "9": "01110-10001-10001-01111-00001-10001-01110", //9
        ":": "00000-00000-00100-00000-00100-00000-00000" //:     
    };
    var show_time = 0 //当前显示时间
    var now_time = 0  //当前执行时间
    var points = []; //点数据集
    var last_color;  //画时最后的颜色
    var last_date;   //最后的时间
    var basics_speed = 10; //基础速度

    var $canvas = document.createElement('canvas');
    $canvas.width = width;
    $canvas.height = height;
    $canvas.innerText = "当前浏览器不支持canvas，请更换浏览器"
    var ctx = $canvas.getContext('2d');
    function Point() {   //数字上的点对象
        this.x = 0;  //当前 x轴
        this.y = 0;  //当前 y轴
        this.gx = 0; //当前 x轴 速度
        this.gy = 0; //当前 y轴 速度
        this.drop = false;  //是否为脱离下落状态
        this.visible = false; //是否为显示状态
        this.color = "";  //当前颜色
    }
    Point.prototype = {
        constructor: Point,
        draw: function () { //画图
            if (last_color !== this.color) {
                ctx.fillStyle = last_color = this.color;
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        },
        update: function (time) { //动作
            if (!this.visible) {
                return false;
            }
            if (this.drop) {
                this.x += this.gx * time;
                this.y += this.gy * time;
                var gy = this.gy + gravity * time;
                if (this.y >= height - radius) {
                    this.y = height - radius;
                    gy = -gy * rebound;
                }
                this.gy = gy;
                if (this.x < -radius || this.x > width + radius || this.y > height + radius) {
                    this.visible = false;
                }
            }
            if (this.radius < radius) {
                this.radius += 0.5;
            }
        },
        reset: function (x, y, color) { //重置到数字位
            this.x = x;
            this.y = y;
            this.color = color;
            this.gx = 0;
            this.gy = 0;
            this.drop = false;
            this.visible = true;
            this.radius = 0;
        },
        setDrop: function () { //设置为脱离数字位
            this.drop = true;
            var random_x = Math.random() * coefficient_random_x + basics_speed;
            var random_y = Math.random() * coefficient_random_y + basics_speed;
            this.gx = Math.random() >= 0.5 ? -random_x : random_x;
            this.gy = random_y;
        }
    }
    //定义动画函数
    MyAnimation = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();


    function init(params) {
        if (!(params instanceof Object)) {
            params = {
                $el: params
            }
        }
        var $el = params.$el, w = params.width, h = params.height, boxShadow = params.boxShadow;
        if (!$el) {
            $el = document.body;
            w = w ? w : 300;
            h = h ? h : 40;
        } else {
            var offsetWidth = $el.offsetWidth;
            w = w ? w : offsetWidth ? offsetWidth : 200;
        }
        var style = "";
        if (boxShadow) {
            style = "box-shadow:" + boxShadow === 'inset' ? +'inset' : '' + " 0 0 10px 0 #fadbd9;";
        }

        var scale_w = w / width;
        var scale_h = h ? h / height : scale_w;
        style += "transform-origin: top left;transform: scale(" + scale_w + "," + scale_h + ");"
        $canvas.style = style;
        if ($canvas.isConnected) {
            return false;
        }
        $el.appendChild($canvas);
        for (var i = 0; i < point_number; i++) {
            points.push(new Point);
        }
        now_time = new Date();
        setTimeString(now_time)
        heart();
    }
    function heart() {
        ctx.clearRect(0, 0, width, height);
        if (now_time - show_time >= 1000) {
            setTimeString(now_time);
        }
        points.forEach(function (p) {
            if (p.visible) {
                p.update(17 / 60)
                p.draw();
            }
        });
        now_time = new Date();
        MyAnimation(heart)
    }
    function setTimeString(time) {
        show_time = time;
        var h = time.getHours() + "", //时
            m = time.getMinutes() + "", //分
            s = time.getSeconds() + ""; //秒
        h = h.length === 1 ? '0' + h : h;
        m = m.length === 1 ? '0' + m : m;
        s = s.length === 1 ? '0' + s : s;
        var now_date = [h, m, s].join(":");
        var color;
        var i = 0;
        if (last_date) {
            for (var j = 0; j < now_date.length; j++) {
                if (last_date.charAt(j) !== now_date.charAt(j)) {
                    i = j;
                    break;
                }
            }
        }
        last_date = now_date;
        var now_date_length = now_date.length;
        var number_string = number_data[':'].split("-");
        var number_string_length = number_string.length;
        var number_frame = number_string[0].length;
        var start_x = (width - (distance * number_frame * now_date_length + (now_date_length - 1) * number_distance)) / 2; //计算时间开始x轴
        var start_y = (height - distance * number_string_length) / 2;  //计算时间的开始y轴

        for (; i < now_date.length; i++) {
            var char_x = start_x + i * (number_distance + number_frame * distance);
            var char_y = start_y;
            var time_char = now_date.charAt(i);
            var number_str = number_data[time_char];
            if (time_char === ":") {
                color = "#aaaaaa";
            } else {
                if (i < 3) {
                    color = "#fde6d2";
                } else if (i < 6) {
                    color = "#fadbd9";
                } else {
                    color = "#cce6ff";
                }
            }
            for (var k = 0; k < number_str.length; k++) {
                var str = number_str.charAt(k);
                if (str === "-") {
                    char_y += distance;
                } else {
                    var x = char_x + k % (number_frame + 1) * (distance);
                    var y = char_y;
                    var drop_point = null;  //脱离点
                    var new_point = null;   //新增到数字位点
                    for (var j = 0; j < points.length; j++) {
                        var point = points[j];
                        if (point.visible && point.x === x && point.y === y) {
                            drop_point = point;
                        } else if (!point.visible && !new_point) {
                            new_point = point;
                        }
                    }
                    if (drop_point && (+str) === 0) {
                        drop_point.setDrop();
                    } else if (!drop_point && (+str) === 1 && new_point) {
                        new_point.reset(x, y, color);
                    }
                }
            }
        }
    }
    win.MyTimeInit = init;
})(window)