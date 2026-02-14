const express = require('express'); 
const router = express.Router(); 

const UsuariosController = require('../controllers/usuarios'); 
const ProdutosController = require('../controllers/produtos'); 
const IngredientesController = require('../controllers/ingredientes');
const CidadesController = require('../controllers/cidades'); 
const ClientesController = require('../controllers/clientes'); 
const EnderecoCliente = require('../controllers/enderecoClientes'); 
const ProdutoIngredientes = require('../controllers/produtoIngredientes');

router.get('/usuarios', UsuariosController.listarUsuarios); 
router.post('/usuarios', UsuariosController.cadastrarUsuarios); 
router.patch('/usuarios/:id', UsuariosController.editarUsuarios);
router.delete('/usuarios', UsuariosController.apagarUsuarios);
router.delete('/usuarios/del/:id', UsuariosController.ocultarUsuario); // params 
router.get('/login', UsuariosController.login); // query

router.get('/produtos', ProdutosController.listarProdutos); 
router.get('/produtos/promocao', ProdutosController.listarPromocoes); 
router.get('/produtos/:id', ProdutosController.listarIngredientesDoProduto);
router.post('/produtos', ProdutosController.cadastrarProdutos); 
router.patch('/produtos', ProdutosController.editarProdutos);
router.delete('/produtos', ProdutosController.apagarProdutos);

router.get('/ingredientes', IngredientesController.listarIngredientes); 
router.post('/ingredientes', IngredientesController.cadastrarIngredientes); 
router.patch('/ingredientes', IngredientesController.editarIngredientes);
router.delete('/ingredientes', IngredientesController.apagarIngredientes);

router.get('/cidades', CidadesController.listarCidades); 
router.get('/cidades/listar-ufs', CidadesController.listarUfs);
router.post('/cidades', CidadesController.cadastrarCidades); 
router.patch('/cidades', CidadesController.editarCidades);
router.delete('/cidades', CidadesController.apagarCidades);

router.get('/clientes', ClientesController.listarClientes); 
router.post('/clientes', ClientesController.cadastrarClientes); 
router.patch('/clientes', ClientesController.editarClientes);
router.delete('/clientes', ClientesController.apagarClientes);

router.get('/endereco-cliente', EnderecoCliente.listarEnderecoClientes); 
router.post('/endereco-cliente', EnderecoCliente.cadastrarEnderecoClientes); 
router.patch('/endereco-cliente', EnderecoCliente.editarEnderecoClientes);
router.delete('/endereco-cliente', EnderecoCliente.apagarEnderecoClientes);

router.get('/produto-ingredientes', ProdutoIngredientes.listarProdutos); 
router.post('/produto-ingredientes', ProdutoIngredientes.cadastrarProdutoIngredientes); 
router.patch('/produto-ingredientes', ProdutoIngredientes.editarProdutoIngredientes);
router.delete('/produto-ingredientes', ProdutoIngredientes.apagarProdutoIngredientes);

module.exports = router;

