newSongClick.addEventListener("click",function(){
    songFormAreaShowOrHidden()
})

changeSongClick.addEventListener("click",function(e){
    songFormAreaShowOrHidden()
})

function songFormAreaShowOrHidden(){
    songFormArea.classList.remove('hidden')
    songFormArea.classList.add('show')
}

{
    let view = {
        el: '#songForm',
        init() {
            this.$el = $(this.el)
        },
        template: `  
            <form class="form">
                <div class="row">
                    <label>歌名</label>
                    <input name="name" type="text" value="__name__">
                </div>
                <div class="row">
                    <label>歌手</label>
                    <input name="singer" type="text" value="__singer__">
                </div>  
                <div class="row">
                    <label>专辑</label>
                    <input name="album" type="text" value="__album__">
                </div>
                <div class="row">
                    <label>格式</label>
                    <input name="format" type="text" value="__format__">
                </div>
                <div class="row">
                    <label>大小</label>
                    <input name="size" type="text" value="__size__">
                </div>
                <div class="row">
                    <label>上传时间</label>
                    <input name="uploadTime" type="text" value="__uploadTime__">
                </div>
                <div class="row">
                    <label>外链</label>
                    <input name="url" type="text" value="__url__">
                </div>
                <div class="row">
                    <label>封面</label>
                    <input name="cover" type="text" value="__cover__">
                </div>
                <div class="row">
                    <label>歌词</label>
                    <textarea cols=100 rows=10 name="lyrics" type="text" value="__lyrics__"></textarea>
                </div>
                <div class="row actions">
                    <button type="submit">保存</button>
                    <button type="reset">重置</button>
                    <button>取消</button>   
                </div>
            </form> 
        `,
        render(data = {}) {
            let placeholders = ['id', 'name', 'singer', 'album', 'format', 'size', 'uploadTime', 'url',
                'cover', 'lyrics']
            let html = this.template
            placeholders.map((string) => {
                html = html.replace(`__${string}__`, data[string] || '')
            })
            $(this.el).html(html)
            if (data.id) {
                $(this.el).prepend('<h1>编辑歌曲</h1>')
            } else {
                $(this.el).prepend('<h1>新建歌曲</h1>')
            }
        },
        reset() {
            this.render({})
        }
    }

    let model = {
        data: {
            id: '',
            name: '',
            singer: '',
            album: '',
            format: '',
            size: '',
            uploadTime: '',
            url: '',
            cover: '',
            lyrics: ''
        },
        update(data) {
            var song = AV.Object.createWithoutData('Song', this.data.id)
            song.set('name', data.name)
            song.set('singer', data.singer)
            song.set('album', data.album)
            song.set('format', data.format)
            song.set('size', data.size)
            song.set('uploadTime', data.uploadTime)
            song.set('url', data.url)
            song.set('cover', data.cover)
            song.set('lyrics', data.lyrics)
            return song.save().then((response) => {
                Object.assign(this.data, data)
                return response
            })
        },
        create(data) {
            // 声明类型
            var Song = AV.Object.extend('Song');
            // 新建对象
            var song = new Song();
            // 设置名称
            song.set('name', data.name)
            song.set('singer', data.singer)
            song.set('album', data.album)
            song.set('format', data.format)
            song.set('size', data.size)
            song.set('uploadTime', data.uploadTime)
            song.set('url', data.url)
            song.set('cover', data.cover)
            song.set('lyrics', data.lyrics)
            return song.save().then((newSong) => {
                let {id, attributes} = newSong
                Object.assign(this.data, {id, ...attributes})
            }, (error) => {
                console.log('error')
                console.error(error);
            });
        }
    }

    let controller = {
        init(view, model) {
            this.view = view
            this.view.init()
            this.model = model

            this.view.render(this.model.data)
            this.bindEvents()
            window.eventHub.on('select', (data) => {
                this.model.data = data
                this.view.render(this.model.data)

            })
            window.eventHub.on('new', (data) => {
                if (this.model.data.id) {
                    this.model.data = {
                        id: '', name: '', singer: '', album: '', format: '', size: '', uploadTime: '', url: '',
                        cover: '', lyrics: ''
                    }
                } else {
                    Object.assign(this.model.data, data)
                }
                this.view.render(this.model.data)
            })
        },
        create() {
            let needs = 'id name singer album format size uploadTime url cover lyrics'.split(' ')
            let data = {}
            needs.map((string) => {
                data[string] = this.view.$el.find(`[name="${string}"]`).val()
            })
            this.model.create(data)
                .then(() => {
                    this.view.reset()
                    let string = JSON.stringify(this.model.data)
                    let object = JSON.parse(string)
                    window.eventHub.emit('create', object)
                })
        },
        update() {
            let needs = 'id name singer album format size uploadTime url cover lyrics'.split(' ')
            let data = {}
            needs.map((string) => {
                data[string] = this.view.$el.find(`[name="${string}"]`).val()
            })
            this.model.update(data)
                .then(() => {
                    alert('更新成功')
                    window.eventHub.emit('update', JSON.parse(JSON.stringify(this.model.data)))
                })
        },
        bindEvents() {
            //提交
            this.view.$el.on('submit', 'form', (e) => {
                e.preventDefault()
                if (this.model.data.id) {
                    this.update()
                } else {
                    this.create()
                }
                songFormArea.classList.add('hidden')
                songFormArea.classList.remove('show')
            })
            //重置
            this.view.$el.on('reset', 'form', (e) => {
                e.preventDefault()
                this.view.reset()
            })
            //取消
            this.view.$el.on('button', 'form', (e) => {
                console.log("song-form取消功能没有解决")
                e.preventDefault()
                songFormArea.classList.add('hidden')
                songFormArea.classList.remove('show')
            })
        }
    }
    controller.init(view, model)
}

