
// draco.innerHTML = "";
setTimeout(function () { CreateFilePicker_Model("DracoFolder", 'Draco_Picker'); }, 500);


function CreateFilePicker_Model(skuid, id) {
    let draco = document.getElementById('draco');
    var input = document.createElement('input');
    input.style.fontSize = "15px";
    input.type = 'file';
    input.accept = '.glb';
    input.id = id;
    input.name = "uploadTexture";
    input.className = id;
    input.style.width = "min-content";
    input.multiple = false;
    var size_tag = document.createElement("p")
    size_tag.id = id + "_size";
    size_tag.name = id + "_size";
    size_tag.style.display = "inline";
    size_tag.style.float = "inline-start";
    size_tag.style.color = "green";
    size_tag.style.fontSize = "14px";
    draco.innerHTML = "";
    draco.appendChild(size_tag);
    draco.appendChild(input);

    // if (animation_present == "") {
    //     input.accept = '.glb';
    // }
    // else {
    //     // if validation require when animation present upload here.
    // }

    //when animation state is not Animation Initiated and the file is selected turn it as blue else keep it as it is
    input.onchange = (e) => {
        if (input.files.length != 0) {
            var file_array = e.target.files[0].name;
            loader();
        }
        let fd = new FormData();
        fd.append('uploadTexture', input.files[0]);
        $.ajax({
            url: '/uploadTextureFiles?skuid=' + skuid + '&&foldername=', //URL for post request
            type: 'POST',  //Type of request
            data: fd, //Data to send
            processData: false, // for sending non-processed data
            contentType: false, // Not set any content type header
            success: function (data) {
                downloadDraco(file_array);
            }, error: function (error) {  //Fail callback
            }
        }).done(function (data) {
            loader_stop();
        });
    }
}

function downloadDraco(FileName) {
    // $.ajax({
    //     url: "/downloadFile",
    //     type: "GET",
    //     success: function (data) {
    //         console.log(data);
    //         console.log('process sucess');

    //     },

    //     error: function () {
    //         console.log('process error');
    //     },
    // })
    var File_Name_Draco = FileName.replace(".glb", "") + "_draco.glb"

    $.ajax({
        type: "GET",
        url: "downloadFile?fileName=" + File_Name_Draco,
        xhrFields: {
            responseType: 'blob' // to avoid binary data being mangled on charset conversion
        },
        success: function (blob, status, xhr) {
            // console.log(xhr);
            // check for a filename
            var filename = "";
            var disposition = xhr.getResponseHeader('Content-Disposition');
            if (disposition && disposition.indexOf('attachment') !== -1) {
                var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                var matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
            }

            if (typeof window.navigator.msSaveBlob !== 'undefined') {
                // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                window.navigator.msSaveBlob(blob, filename);
            } else {
                var URL = window.URL || window.webkitURL;
                var downloadUrl = URL.createObjectURL(blob);

                if (filename) {
                    // use HTML5 a[download] attribute to specify filename
                    var a = document.createElement("a");
                    // safari doesn't support this yet
                    if (typeof a.download === 'undefined') {
                        window.location.href = downloadUrl;
                        console.log(downloadUrl)
                    } else {
                        a.href = downloadUrl;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                    }
                } else {
                    window.location.href = downloadUrl;
                }

                setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
            }
        }
    }).done(function (data) {

        DeleteFile(File_Name_Draco)
    });

}

function DeleteFile(File_Name_Draco) {
    $.ajax({
        url: "/DeleteFile?fileName=" + File_Name_Draco,
        type: "GET",
        success: function (data) {
            console.log(data);
            console.log('process sucess');

        },

        error: function () {
            console.log('process error');
        },
    })
}

function loader() {
    document.getElementsByClassName("loader")[0].style.display = "block";
    var myFieldset = document.getElementById("myFieldset");
    myFieldset.disabled = true;
}
function loader_stop() {
    document.getElementsByClassName("loader")[0].style.display = "none";
    var myFieldset = document.getElementById("myFieldset");
    myFieldset.disabled = false;
}