# Network Interface
resource "aws_network_interface" "web_server_nic" {
  subnet_id       = aws_subnet.subnet_1.id
  private_ips     = [var.private_ip]
  security_groups = [aws_security_group.allow_web.id]
}

# Elastic IP
resource "aws_eip" "one" {
  network_interface         = aws_network_interface.web_server_nic.id
  associate_with_private_ip = var.private_ip
  depends_on                = [aws_internet_gateway.gw]
}

# EC2 Instance
resource "aws_instance" "my_server" {
  ami           = var.ami_id
  instance_type = var.instance_type
  key_name      = var.key_pair

  network_interface {
    device_index         = 0
    network_interface_id = aws_network_interface.web_server_nic.id
  }

  tags = {
    Name = "leave-management-app"
  }

  depends_on = [aws_network_interface.web_server_nic]
}
