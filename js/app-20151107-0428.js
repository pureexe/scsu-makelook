//var context = $('#upload-canvas')[0].getContext('2d');
$(document).ready(function(){
    checkRequirement();
    $('#step-1').show();
    $('#step-2').hide();
    $('#step-3').hide();
});

var oriContext;

$('#file-uploader').change(function(){
    var input = this;

    var oldUploadButtonText = $('#btn-upload').html();
    $('#btn-upload').prop('disabled', true).html('กำลังอัพโหลด รอสักครู่นะ...').addClass('disabled');
        if (input.files && input.files[0]) {

        if(!input.files[0].type.match('image/jp.*') && !input.files[0].type.match('image/png')) {
            swal('มีอะไรบางอย่างไม่ถูกต้องแหละ!', 'กรุณาอัพโหลดภาพสกุล .jpg หรือ .png เท่านั้นนะ', 'error');
            $('#btn-upload').prop('disabled', false).html(oldUploadButtonText).removeClass('disabled');
            return;
        }

        var reader = new FileReader();

        reader.onload = (function (file) {
            return function(e) {
                var img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    swal('อัพโหลดภาพเสร็จแล้ว!', 'จากนั้นมาปรับขนาดของภาพกันนะ ลองเลย รออะไรอยู่!', 'success');

                    var width = img.width;
                    var height = img.height;

                    var MAX_WIDTH = 1024;
                    var MAX_HEIGHT = 1024;

                    if (width > height) {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    } else {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    }

                    var canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    var dataurl = canvas.toDataURL();

                    $('#step-1').hide();
                    $('#step-2').show();

                    $('#img-preview').cropper('reset').cropper('replace', dataurl).cropper('setAspectRatio', 1);
                    $('#img-preview').show();
                }
            };

        })(input.files[0]);
        reader.readAsDataURL(input.files[0]);
    } else {
        swal('ขอโทษด้วยนะ', 'อัพโหลดภาพไม่ได้ครับ ลองอัพใหม่อีกครั้งนะ', 'error');
        $('#btn-upload').prop('disabled', false).html(oldUploadButtonText).removeClass('disabled');
    }
});

$('#btn-to-step-3').click(function(){
    $('#step-2').hide();
    var destContext = $('#img-canvas')[0].getContext('2d');
    oriContext = $('#img-preview').cropper('getCroppedCanvas');
    var srcContext = $('#img-preview').cropper('getCroppedCanvas');
    destContext.drawImage(srcContext, 0, 0, $('#img-canvas')[0].width, $('#img-canvas')[0].height);
    $('#btn-download').prop('disabled', true);
    $('#step-3').show();
    var $root = $('html, body');
    $root.animate({
        scrollTop: $('#step-3 h2').offset().top - 40
    }, 300);
});


$('#btn-download').click(function(){
    var img = $('#img-canvas')[0].toDataURL("image/png");
    ReImg.fromCanvas(document.getElementById('img-canvas')).downloadPng();
});

function overlayImage(filename) {
    $('#loading').show();
    var destContext = $('#img-canvas')[0].getContext('2d');
    destContext.clearRect(0, 0, $('#img-canvas')[0].width, $('#img-canvas')[0].height);
    destContext.drawImage(oriContext, 0, 0, $('#img-canvas')[0].width, $('#img-canvas')[0].height);
    if (filename) {
        var img = new Image();
        img.src = filename;
        img.onload = function() {
            destContext.drawImage(img, 0, 0, $('#img-canvas')[0].width, $('#img-canvas')[0].height);
        }
        $('#btn-download').prop('disabled', false);
    }
    $('#loading').hide();
    var $root = $('html, body');
    $root.animate({
        scrollTop: $('#step-3').offset().top - 40
    }, 300);
}

function checkRequirement() {
    if (!(window.File && window.FileReader)) {
        swal('ขอโทษด้วยนะ', 'เราพบว่า browser ของคุณไม่สามารถใช้งานเว็บของเราได้ ลองเปลี่ยน browser แล้วเข้ามาใหม่นะ ขออภัยอีกครั้งครับ', 'error');
        $('#btn-upload').prop('disabled', true).html('ขออภัยด้วย browser ของคุณไม่สามารถใช้งานได้').addClass('disabled');
    }
}

$('#btn-rotate-ccw').click(function(){ $('#img-preview').cropper('rotate', -90); });
$('#btn-rotate-cw').click(function(){ $('#img-preview').cropper('rotate', 90); });
$.get('asset/tags.json', function( data ) {
  var output = "";
  data.forEach(function(tag_info){
    var column_class = tag_info.meta.class;
    output+='<div class="row overlay-selector"><div class="col-md-12 overlay-selector-header"><hr><h3>';
    output+=tag_info.meta.title;
    output+='</h3></div></div><div class="row overlay-selector">';
    tag_info.tags.forEach(function(tag){
      output+='<div class="'+column_class+'"><button id="btn-team-'+tag.id+'" data-tagid="'+tag.id+'" data-path="'+tag.path+'" class="intania-team btn btn-default btn-block"><b>'+tag.title+'</b><br><small>'+tag.description+'</small></button></div>';
      $.get(tag.path); // preload for UX improve
    })
    output+='</div>';
  });
  $("#boxList").html(output);
  $('.intania-team').click(function(){
  	overlayImage( $(this).data('path') );
  });
});
