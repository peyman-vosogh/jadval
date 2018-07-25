const cc = console.log;
var result;
var activeRow;
var req = getUrlParameter('page');
cc(req)
$(function(){
    var getTableUser = ()=>{
        $('#getUser').children().remove();
        $.ajax({
            url: '/admin/content/table/user/get',
            type: 'POST',
            data : {tableId : $('#getTable').val()},
            success: function (d) {
                let result = JSON.parse(d);
                $('#getUser').append('<option value="0">انتخاب کاربر</option>');
                result.map((e,i)=>{
                    let option = $('<option>');
                    option.attr('value' , e.TableAnswer.id);
                    option.text(e.TableAnswer.name);
                    $('#getUser').append(option);
                });
            }
        });
    }

    var getLastTable = ()=>{
        $('#jadval').children().remove();
        $.ajax({
            url: '/admin/content/table/get',
            type: 'POST',
            data : {tableId : $('#getTable').val()},
            success: function (d) {
                let result = JSON.parse(d);
                var res = eval(result.Table.answer_list);
                let table = createTable(res);
                $('#jadval').append(table);
                $('#0-0').removeClass('blank').css({border : 0});
            }
        });
    }
    var getUserAnswer = (id)=>{
        $('#jadval').children().remove();
        if(id != 0){
            $.ajax({
                url: '/admin/content/table/user/get/answer',
                type: 'POST',
                data : {
                    id : id
                },
                success: function (d) {
                    let result = JSON.parse(d);
                    var res = eval(result[0]);
                    var valid = eval(result[1]);
                    let table = createTable(res , valid);
                    $('#jadval').append(table);
                    $('#0-0').removeClass('blank').css({border : 0});
                }
            });
        }
        
    }
    var getTableList = ()=>{
        $('#getTable').children().remove();
        $.ajax({
            url: '/admin/content/table/gets',
            type: 'POST',
            success : (d)=>{
                let result = JSON.parse(d);
                result.map((e,i)=>{
                    let option = $('<option>');
                    option.attr('value' , e.Table.id);
                    option.attr('row' , eval(e.Table.answer_list).length)
                    option.text(e.Table.title);
                    $('#getTable').append(option);
                });
                getLastTable();
                getTableUser();
            }
        });
    }
    var createTable = (res , valid=null)=>{
        var table = $('<table>' , {class : 'table'});
        for(var i = 0 ; i < res.length ; i++){
            var tr = $('<tr>');
            for(var j = 0 ; j < res[i].length ; j++){
                var clases = res[i][j]=="" ? 'blank' : 'place';
                let edit   = res[i][j]=="" ? 'false' : 'true';
                var td     = $('<td>',{contenteditable : edit ,class : clases , id : i+'-'+j});
                let btn = $('<button>' , {class : 'btn'});
                if(!Number.isInteger(res[i][j]*1) && req=='admin') {
                    td.append(res[i][j]);
                    if(valid){
                        if(res[i][j] == valid[i][j]){
                            td.removeClass('red')
                            td.addClass('green')
                        }else{
                            td.removeClass('green')
                            td.addClass('red')
                        }
                    }
                }
                if(Number.isInteger(res[i][j]*1) && res[i][j]*1 !=0){
                    btn.text(res[i][j]);
                    btn.attr('onclick' , 'addQuestion("'+i+'-'+j+'")')
					td.prop('contenteditable' , false); 
					td.css({border : 0 , cursor : 'pointer'})
                    td.append(btn);
                }
                tr.append(td);
            }
            table.append(tr);
        }
        return table;
    }
    var contentTableSave = (row , col)=>{
        let topic = $('#tableTit').val();	
        let ans = [];
        for(let i = 0 ; i<=row*1 ; i++){
            for(let j = 0 ; j <=col*1 ; j++){
                if(j%(row*1+1)==0) ans[i] = [];
		        ans[i][j] = '';
            }
        }
        let data = {
            topic : topic ,
            ans : ans ,
        }
        $.ajax({
            url: '/admin/content/table/save',
            type: 'POST',
            data: data,
            success: function (d) {
                getTableList();
            }
        });
    }
    var createJadval = (w,h)=>{
		$('#jadval').children().remove();
		let table = $('<table>' , {class : 'table'});
		for(let i = 0 ; i <= w ; i++){
			let tr = $('<tr>');
			for(let j = 0 ; j <= h ; j++){
				let td     = $('<td>',{contenteditable : 'true', maxlength:1 ,class : 'place' , id : i+'-'+j});
                let span = $('<span>');
                let btn = $('<button>' , {class : 'btn'});
				if(i == 0){
                    btn.text(j);
                    btn.attr('onclick' , 'addQuestion("'+i+'-'+j+'")')
					td.prop('contenteditable' , false); 
					td.css({border : 0 , cursor : 'pointer'})
                    td.append(btn);
				}
				if(j == 0){
					btn.text(i);
                    btn.attr('onclick' , 'addQuestion("'+i+'-'+j+'")')
					td.prop('contenteditable' , false); 
					td.css({border : 0 , cursor : 'pointer'})
                    td.append(btn);
				}
				if(td.text() == '0') td.text('');
				tr.append(td);
			}
			table.append(tr);
		}
		$('#jadval').append(table);
    }
    
    $('.closer').click(()=>{
        $('.lightbox').fadeOut();
    });
    $('#addTable').click(()=>{
        $('.lightbox').fadeIn();
    });
    getTableList();
    
    
    $('#getTable').change(()=>{
        getLastTable();
        getTableUser();
    });

    $('#getUser').change(()=>{
        let user = $('#getUser').val();
        if(user*1 == 0) getLastTable();
        else getUserAnswer(user);
    })
    $('#saveTable').click(()=>{
        var row = $('#row').val();
        let col = $('#col').val();
        row = row > 10 ? 10 : row;
        col = col > 10 ? 10 : col;
        contentTableSave(row , col);
        setTimeout(()=>{
            createJadval(row , col);
        },1000)
    });
    $('#saveAllTable').click(()=>{
        let select = $('#getTable').val();
        let rowT = $('#getTable option:selected').attr('row');
        let ans = [];
        $('#jadval td').map((i,e)=>{
            let pos = $(e)[0].id.split('-');
            if(i%(rowT*1)==0) ans[pos[0]*1] = [];
            ans[pos[0]*1][pos[1]*1] = $(e)[0].innerText;
        });
        $.ajax({
            url: '/admin/content/table/update/'+select,
            type: 'POST',
            data: { ans : ans },
            success: function (d) {
                cc('ok')
            }
        });
    });

    $('#okTable').click(()=>{
        let tableId = $('#getTable').val();
        let userName = $('#username').val();
        let rowT = $('#getTable option:selected').attr('row');
        let ans = [];
        $('#jadval td').map((i,e)=>{
            let pos = $(e)[0].id.split('-');
            if(i%(rowT*1)==0) ans[pos[0]*1] = [];
            ans[pos[0]*1][pos[1]*1] = $(e)[0].innerText;
        });
        let data = {
            tableId : tableId,
            userName : userName,
            ans : ans ,
        }
        $.ajax({
            url: '//admin/content/table/answer',
            type: 'POST',
            data: data,
            success: function (d) {
                cc(d)
            }
        });
    })


    $('#questionList').blur(()=>{
        let select = $('#getTable').val();
        let question = $('#questionList').val();
        let data = {
            select : select,
            question : question,
            activeRow : activeRow
        }
        $.ajax({
            url: '/admin/content/table/question/add',
            type: 'POST',
            data: data,
            success: function (d) {
                $('#questionList').val('');
                $('#questionC').hide();
            }
        });
    });

    $('#jadval').on('keyup','td',(()=>{
        var limit = 1;
        var text = $(this)[0].activeElement.innerText;
        if(text.length >= limit){
            var new_text = text.substr(0,limit);
            $(this)[0].activeElement.innerText = new_text
        }
    }));
});

function getUrlParameter(sParam){
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
function addQuestion(d){
    $('#questionC').show();
    activeRow = d;
    data = {
        activeRow : activeRow,
        tableId : $('#getTable').val()
    }
    $.ajax({
        url: '/admin/content/table/question/get',
        type: 'POST',
        data: data,
        success: function (d) {
            $('#questionList').val(d);
            $('#questionGet').html(d);
        }
    });
}