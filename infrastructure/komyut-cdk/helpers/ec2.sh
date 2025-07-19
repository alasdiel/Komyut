docker run -t -i -p 5000:5000 -v /home/ec2-user/data:/data osrm/osrm-backend osrm-routed --algorithm mld /data/philippines-latest.osrm > /home/ec2-user/osrm.log 2>&1
