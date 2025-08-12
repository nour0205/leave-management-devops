output "instance_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_eip.one.public_ip
}

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.my_server.id
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.my_vpc.id
}
