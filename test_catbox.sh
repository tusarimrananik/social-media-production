#!/bin/bash
echo "test" > test.txt
curl -F "reqtype=fileupload" -F "fileToUpload=@test.txt" https://catbox.moe/user/api.php
