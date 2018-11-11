//index.js
//获取应用实例
const app = getApp();

Page({
    data: {
        themeText: '',
        contentText: '',
        prevAnim: null,
        imgData: null,
        contentEditable: true,
        activeSaveBtn: false,
    },

    saveImageHeight: 0,

    onThemeInput(ev) {
        const evData = ev.detail;
        this.setData({
            themeText: evData.value
        });
    },

    onContentInput(ev) {
        const evData = ev.detail;
        let val = evData.value;
        this.setData({
            contentText: val,
            showContent: val.replace(/\n/g, '<br/>')
        });
    },

    saveToAlbum() {
        const _this = this;
        const sysInfo = wx.getSystemInfoSync();
        wx.canvasToTempFilePath({
            canvasId: 'cardMaker',
            x: 0,
            y: 0,
            width: sysInfo.windowWidth,
            height: _this.saveImageHeight,
            destWidth: sysInfo.windowWidth * sysInfo.pixelRatio,
            destHeight: _this.saveImageHeight * sysInfo.pixelRatio,
            quality: 1,
            fileType: 'png',
            success: (res) => {
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success(res) {
                        wx.showToast({
                            title: '卡片保存成功',
                            duration: 1500
                        });
                        _this.hidePrev();
                    },
                    fail() {
                        wx.showToast({
                            title: '保存失败',
                            icon: 'none',
                            duration: 1500
                        });
                    }
                });
            }
        }, this);
    },

    drawCard() {
        const _this = this;
        const sysInfo = wx.getSystemInfoSync();
        // console.log('System info: ', sysInfo);

        const context = wx.createCanvasContext('cardMaker', this);
        const cvsHeight = sysInfo.windowHeight * 0.72;
        context.setFillStyle('#fff');
        context.fillRect(0, 0, sysInfo.windowWidth, cvsHeight);
        context.setStrokeStyle('#999');
        context.setLineWidth(0.5);
        context.moveTo(0, 40);
        context.lineTo(sysInfo.windowWidth, 40);
        context.stroke();
        context.setTextBaseline('top');
        context.setFillStyle('#333');
        context.setFontSize(18);
        context.fillText(_this.data.themeText, 10, 12, (sysInfo.windowWidth - 20));
        context.setFontSize(48);
        context.setFillStyle('#e0e0e0');
        context.fillText('“', 10, 48);
        context.save();

        const multLine = this.drawMultLineText(context, sysInfo.windowWidth - 74);

        context.restore();
        context.fillText('”', (sysInfo.windowWidth - 38), 30 + multLine);
        context.setFontSize(12);
        context.setFillStyle('#999');
        context.fillText('时间：' + this.formatDate(new Date()), 10, 30 + multLine + 30);
        
        context.draw(true, () => {
            // console.log('Draw over');
            this.setData({
                activeSaveBtn: true
            });

            this.saveImageHeight = 80 + multLine;
            // wx.canvasGetImageData({
            //     canvasId: 'card-maker',
            //     x: 0,
            //     y: 0,
            //     width: rect.width,
            //     height: rect.height,
            //     success: (res) => {
            //         console.log(res);
            //     }
            // });
        });
    },

    drawMultLineText(ctx, maxWidth) {
        ctx.setFontSize(14);
        const rows = this.data.contentText.split(/\n/);
        const lineHeight = 24;
        let renderRows = [];
        ctx.setFillStyle('#333');

        rows.forEach((r, i) => {
            const textWidth = ctx.measureText(r);
            // console.log(textWidth, r);
            if (textWidth.width > maxWidth) {
                const subRows = this.calcRow(ctx, r, maxWidth);
                // console.log(subRows);
                renderRows = renderRows.concat(subRows);
            } else {
                renderRows.push(r);
            }
        });

        renderRows.forEach((r, i) => {
            ctx.fillText(r, 40, 56 + i * lineHeight);
        });

        return renderRows.length * lineHeight;
    },

    calcRow(ctx, text, width) {
        text = text || '';
        const textArr = text.split('');
        const row = [];
        let charPosi = 0;
        for (let i = 15, tl = textArr.length; i < tl; i++) { // i = 15, 15个汉字以内不可能超过maxWidth
            const subTextWidth = ctx.measureText(text.substring(charPosi, i + 1));
            if (subTextWidth.width > width) {
                row.push(text.substring(charPosi, i));
                if (i + 15 > tl - 1) {
                    row.push(text.substr(i));
                    break;
                } else {
                    charPosi = i;
                    i += 14;
                }
            } else if (i === tl - 1) {
                row.push(text.substr(charPosi));
            }
        }
        return row;
    },

    formatDate(date) {
        date = date || new Date();
        return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`
    },

    formSubmit(ev) {
        this.drawCard();

        this.animation.top(0).step();

        this.setData({
            contentEditable: false,
            prevAnim: this.animation.export()
        });
    },

    hidePrev() {
        this.animation.top('100%').step();
        this.setData({
            contentEditable: true,
            activeSaveBtn: false,
            prevAnim: this.animation.export()
        });
    },

    onLoad: function() {

        wx.showShareMenu({
            withShareTicket: true
        });

        let animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'ease-out',
        });

        this.animation = animation;

        animation.top('100%').step({duration: 0});
        this.setData({
            prevAnim: animation.export()
        });
    }
});
