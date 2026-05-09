#!/bin/bash
ssh -N -L 27017:$(ssh vbuds "docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}'  bsc-imgupload_mongodb_1"):27017 vbuds