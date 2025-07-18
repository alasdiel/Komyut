#!/bin/bash

exec > >(tee -a /home/ec2-user/init.log | logger -t user-data -s) 2>&1
set -x  # Print each command before executing

echo "===== STARTING EC2 INIT SCRIPT ====="

echo "Updating packages..."
sudo yum update -y

echo "Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo usermod -a -G docker ec2-user

echo "Setting up 10GB swap file..."
sudo /bin/dd if=/dev/zero of=/var/swapfile bs=1M count=10240 status=progress
sudo /sbin/mkswap /var/swapfile
sudo chmod 600 /var/swapfile
sudo /sbin/swapon /var/swapfile
echo "Swap setup complete"

echo "Creating data directory..."
mkdir -p /home/ec2-user/data

echo "Waiting for osrm-data.tar.gz in S3..."
while ! aws s3 ls s3://komyut-permanent-${ROUTEPACK_BUCKET_SUFFIX}/osrm-data.tar.gz; do
  echo "File not yet available... waiting 30s"
  sleep 30
done

echo "File found! Downloading..."
aws s3 cp s3://komyut-permanent-${ROUTEPACK_BUCKET_SUFFIX}/osrm-data.tar.gz /home/ec2-user/osrm-data.tar.gz

echo "Extracting OSRM data..."
tar -xvzf /home/ec2-user/osrm-data.tar.gz -C /home/ec2-user/data

echo "Starting OSRM in Docker..."
docker run -d -p 5000:5000 -v /home/ec2-user/data:/data osrm/osrm-backend osrm-routed --algorithm mld /data/philippines-latest.osrm > /home/ec2-user/osrm.log 2>&1

sleep 5
echo "Appending Docker container logs to osrm.log..."
docker logs $(docker ps -q --filter ancestor=osrm/osrm-backend) >> /home/ec2-user/osrm.log

echo "===== EC2 INIT SCRIPT COMPLETE ====="
