const express = require('express');
const router = express.Router();

const UsuariosController = require('../controllers/usuarios');
const ProdutosController = require('../controllers/produtos');
const IngredientesController = require('../controllers/ingredientes');
const CidadesController = require('../controllers/cidades');
const ClientesController = require('../controllers/clientes');
const EnderecoClienteController = require('../controllers/enderecoClientes');
const ProdutoIngredientesController = require('../controllers/produtoIngredientes');
const PedidosController = require('../controllers/pedidos');
const PedidoProdutosController = require('../controllers/pedidoProdutos');

// Chamada do componte de inserção de imagem
const uploadImage = require('../middleware/uploadHelper');
// Middleware configurado para a pasta 'ingredientes'
const uploadIngredientes = uploadImage('ingredientes');

router.get('/usuarios', UsuariosController.listarUsuarios);
router.post('/usuarios', UsuariosController.cadastrarUsuarios);
router.patch('/usuarios/:id', UsuariosController.editarUsuarios); // params
router.patch('/usuarios/atualiza-senha/:id', UsuariosController.atualizaSenha); // params
router.delete('/usuarios/:id', UsuariosController.apagarUsuarios); // params
router.delete('/usuarios/del/:id', UsuariosController.ocultarUsuario); // params 
router.get('/login', UsuariosController.login); // query

router.get('/produtos', ProdutosController.listarProdutos);
router.get('/produtos/promocao', ProdutosController.listarPromocoes);
router.get('/produtos/:id', ProdutosController.listarIngredientesDoProduto);
router.post('/produtos', ProdutosController.cadastrarProdutos);
router.patch('/produtos', ProdutosController.editarProdutos);
router.delete('/produtos', ProdutosController.apagarProdutos);

router.get('/ingredientes', IngredientesController.listarIngredientes);
router.post('/ingredientes', uploadIngredientes.single('img'), IngredientesController.cadastrarIngredientes); 
router.patch('/ingredientes/:id', uploadIngredientes.single('img'), IngredientesController.editarIngredientes);
router.delete('/ingredientes/:id', IngredientesController.apagarIngredientes);

router.get('/cidades', CidadesController.listarCidades);
router.get('/cidades/listar-ufs', CidadesController.listarUfs);
router.post('/cidades', CidadesController.cadastrarCidades);
router.patch('/cidades', CidadesController.editarCidades);
router.delete('/cidades', CidadesController.apagarCidades);

router.get('/clientes', ClientesController.listarClientes);
router.post('/clientes', ClientesController.cadastrarClientes);
router.patch('/clientes/:id', ClientesController.editarClientes); // params
router.delete('/clientes', ClientesController.apagarClientes);

router.get('/endereco-cliente', EnderecoClienteController.listarEnderecoClientes);
router.post('/endereco-cliente', EnderecoClienteController.cadastrarEnderecoClientes);
router.patch('/endereco-cliente/:id', EnderecoClienteController.editarEnderecoClientes);
router.delete('/endereco-cliente/:id', EnderecoClienteController.apagarEnderecoClientes);

router.get('/produtos', ProdutosController.listarProdutos);
router.post('/produtos', ProdutosController.cadastrarProdutos);
router.patch('/produtos/:id', ProdutosController.editarProdutos);
router.delete('/produtos', ProdutosController.apagarProdutos);
router.get('/produtos/promocao', ProdutosController.listarPromocoes);
router.get('/produtos/:id', ProdutosController.listarIngredientesDoProduto);

router.get('/produto-ingredientes', ProdutoIngredientesController.listarProdutoIngredientes);
router.post('/produto-ingredientes', ProdutoIngredientesController.cadastrarProdutoIngredientes);
router.patch('/produto/:idProd/ingrediente/:idIng', ProdutoIngredientesController.editarProdutoIngredientes);
router.delete('/produto/:produto/ingrediente/:ingrediente', ProdutoIngredientesController.apagarProdutoIngredientes);

router.get('/pedidos', PedidosController.listarPedidos);
router.post('/pedidos', PedidosController.cadastrarPedidos);
router.patch('/pedidos/:id', PedidosController.editarPedidos);
router.delete('/pedidos/:id', PedidosController.apagarPedidos);

router.get('/pedido-produtos', PedidoProdutosController.listarPedidoProdutos);
router.post('/pedido-produtos', PedidoProdutosController.cadastrarPedidoProdutos);
router.patch('/pedido-produtos/:id', PedidoProdutosController.editarPedidoProdutos);
router.delete('/pedido-produtos/:id', PedidoProdutosController.apagarPedidoProdutos);

module.exports = router;

