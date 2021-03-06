/**
 * @author tgwice@163.com
 */

define(function(require, exports, module) {
    $('form').on('submit', function() {
        $.ajax({
            url: '/auth/register.json',
            type: 'POST',
            data: {
                user: $('[name="user"]').val(),
                password: $('[name="password"]').val(),
                repassword: $('[name="repassword"]').val()
            },
            dataType: 'json',
            success: function(data) {
                if(data.status === 1){
                    location.href = data.result.url;
                }else{
                    $('.error').remove();
                    $('[type="submit"]').before('<p class="error">' + data.message + '</p>')
                }
            }
        })
        event.preventDefault();
    })
});
