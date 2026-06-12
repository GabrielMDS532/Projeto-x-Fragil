select * from usuario;
describe paciente;

INSERT INTO usuario (nome_usuario, sobrenome_usuario, email, senha, tipo_usuario) 
VALUES 
('Admin', 'Principal', 'admin@triagem.com', '123456', 'ADMIN'),
('Medico', 'Teste', 'medico@triagem.com', '123456', 'USUARIO');

ALTER TABLE paciente 
ADD COLUMN cpf VARCHAR(14) NOT NULL UNIQUE AFTER nome_paciente;

SELECT * FROM paciente;