{
    let view = {
        el:'.songList-container',
        template:`
            <table></table>
        `,
        render(data){
            let $el = $(this.el)
            $el.html(this.template)
            let {songs, selectedSongId} = data
            let trList = songs.map((song)=>{
                // console.log("歌曲列表")
                // console.log(song)

                let $tr = $('<tr></tr>')
                let $thId = $('<th></th>').text(song.length).attr('data-song-id',song.id)
                let $thName = $('<th></th>').text(song.name).attr('data-song-id',song.id)
                let $thSinger = $('<th></th>').text(song.singer).attr('data-song-id',song.id)
                let $thAlbum = $('<th></th>').text(song.album).attr('data-song-id',song.id)
                let $thFormat = $('<th></th>').text(song.format).attr('data-song-id',song.id)
                let $thSize = $('<th></th>').text(song.size).attr('data-song-id',song.id)
                let $thUploadTime = $('<th></th>').text(song.uploadTime).attr('data-song-id',song.id)

                $tr.append($thId,$thName,$thSinger,$thAlbum,$thFormat,$thSize,$thUploadTime)

                if(song.id === selectedSongId){
                    $tr.addClass('active')
                    $('#changeSongClick').removeAttr("disabled");
                }
                return $tr
            })

            $el.find('table').empty()
            trList.map((domLi)=>{
                $el.find('table').append(domLi)
            })
        },
        clearActive(){
            $(this.el).find('.active').removeClass('active')
        }
    }
    let model = {
        data:{
            songs:[ ],
            selectSongId:undefined,
        },
        find(){
            var query = new AV.Query('Song');
            return query.find().then((songs)=>{
                this.data.songs = songs.map((song)=>{
                    return {id:song.id,...song.attributes}
                })
                return songs
            })
        }
    }
    let controller = {
        init(view,model){
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.bindEvents()
            this.bindEventHub()
            this.getAllSongs()
        },
        getAllSongs(){
            return this.model.find().then(()=>{
                this.view.render(this.model.data)
            })
        },
        bindEvents(){
            $(this.view.el).on('click','th',(e)=>{
                let songId = e.currentTarget.getAttribute('data-song-id')
                this.model.data.selectedSongId = songId
                this.view.render(this.model.data)

                let data
                let songs = this.model.data.songs
                for(let i=0; i<songs.length; i++){
                    if(songs[i].id === songId){
                        data = songs[i]
                        break
                    }
                }
                window.eventHub.emit('select',JSON.parse(JSON.stringify(data)))
            })
        },
        bindEventHub(){
            window.eventHub.on('create',(songData)=>{
                this.model.data.songs.push(songData)
                this.view.render(this.model.data)
            })
            window.eventHub.on('new',()=>{
                this.view.clearActive()
            })
            window.eventHub.on('update',(song)=>{
                let songs = this.model.data.songs
                for(let i =0; i < songs.length; i++){
                    if(songs[i].id === song.id){
                        Object.assign(songs[i],song)
                    }
                }
                this.view.render(this.model.data)
            })
        }
    }
    controller.init(view,model)
}