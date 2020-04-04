/**
 * @author tgwice@163.com
 */

define(function(require, exports, module) {
    //图片上传
    $('[name="uploadIframe"]').on('load', function() {
        var res = JSON.parse($(this).contents().find('pre').html());
        if (res.status === 1) {
            $('#portraitImage').attr('src', res.result.picture);
            $('#profileForm [name="headPic"]').val(res.result.picture);
        } else {
            alert(res.message);
        }
    });
    $('[type="file"]')[0].addEventListener('change', function(event) {
        if (this.files.length) {
            $('#uploadFile').submit();
        }
    })

    $('#profileForm').on('submit', function() {
        let _this = this;
        $.ajax({
            url: '/account/uploadProfile.json',
            type: 'POST',
            data: {
                headPic: $(_this).find('[name="headPic"]').val(),
                user: $(_this).find('[name="user"]').val()
            },
            success: function(res) {
                if (res.status === 1) {
                    alert('保存成功');
                    console.log(location.href);
                    // location.reload();
                } else {
                    alert(res.message);
                }
            }
        })
        return false;
    })
});