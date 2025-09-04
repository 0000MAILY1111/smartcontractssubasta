// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Subasta
 * @dev Contrato inteligente para manejar subastas con depósitos y comisiones
 * @custom:dev-run-script scripts/deploy.js
 */
contract Subasta {
    // Variables de estado
    address public propietario;
    address public ganador;
    uint256 public ofertaGanadora;
    uint256 public tiempoFinalizacion;
    bool public subastaFinalizada;
    
    // Descripción del artículo
    string public descripcionArticulo;
    
    // Mapeo para almacenar las ofertas de cada usuario
    mapping(address => uint256) public ofertas;
    
    // Array para llevar registro de todos los oferentes
    address[] public oferentes;
    
    // Mapeo para verificar si una dirección ya es oferente
    mapping(address => bool) public esOferente;
    
    // Comisión del 2%
    uint256 public constant COMISION = 2;
    
    // Incremento mínimo del 5%
    uint256 public constant INCREMENTO_MINIMO = 5;

    // Eventos
    event NuevaOferta(address indexed oferente, uint256 monto, uint256 timestamp);
    event SubastaFinalizada(address indexed ganador, uint256 montoGanador, uint256 timestamp);
    event ReembolsoRealizado(address indexed oferente, uint256 monto);

    // Modificadores
    modifier soloPropiertario() {
        require(msg.sender == propietario, "Solo el propietario puede ejecutar esta funcion");
        _;
    }
    
    modifier subastaActiva() {
        require(block.timestamp < tiempoFinalizacion, "La subasta ha finalizado");
        require(!subastaFinalizada, "La subasta ya fue finalizada");
        _;
    }
    
    modifier subastaTerminada() {
        require(block.timestamp >= tiempoFinalizacion || subastaFinalizada, "La subasta aun esta activa");
        _;
    }

    /**
     * @dev Constructor que inicializa la subasta
     * @param _descripcionArticulo Descripción del artículo en subasta
     * @param _duracionHoras Duración de la subasta en horas
     */
    constructor(
        string memory _descripcionArticulo,
        uint256 _duracionHoras
    ) {
        require(_duracionHoras > 0, "La duracion debe ser mayor a 0");
        require(bytes(_descripcionArticulo).length > 0, "Debe proporcionar una descripcion");
        
        propietario = msg.sender;
        descripcionArticulo = _descripcionArticulo;
        tiempoFinalizacion = block.timestamp + (_duracionHoras * 1 hours);
        subastaFinalizada = false;
    }

    /**
     * @dev Permite a los usuarios hacer ofertas
     */
    function ofertar() external payable subastaActiva {
        require(msg.sender != propietario, "El propietario no puede ofertar");
        require(msg.value > 0, "La oferta debe ser mayor a 0");
        
        // Verificar que la oferta sea al menos 5% mayor que la actual ganadora
        uint256 ofertaMinima = ofertaGanadora + (ofertaGanadora * INCREMENTO_MINIMO / 100);
        require(msg.value >= ofertaMinima, "La oferta debe ser al menos 5% mayor que la oferta actual");
        
        // Si el usuario ya había ofertado, sumar a su oferta total
        if (esOferente[msg.sender]) {
            ofertas[msg.sender] += msg.value;
        } else {
            ofertas[msg.sender] = msg.value;
            oferentes.push(msg.sender);
            esOferente[msg.sender] = true;
        }
        
        // Actualizar la oferta ganadora si es necesaria
        if (ofertas[msg.sender] > ofertaGanadora) {
            ofertaGanadora = ofertas[msg.sender];
            ganador = msg.sender;
        }
        
        emit NuevaOferta(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Permite a los oferentes retirar el exceso de su oferta
     * Solo pueden retirar lo que esté por encima de la oferta ganadora actual
     */
    function retirarExceso() external subastaActiva {
        require(esOferente[msg.sender], "No has realizado ninguna oferta");
        require(msg.sender != ganador, "El ganador actual no puede retirar fondos");
        
        uint256 ofertaUsuario = ofertas[msg.sender];
        uint256 montoARetirar = 0;
        
        // Si la oferta del usuario es mayor que la ganadora, puede retirar el exceso
        if (ofertaUsuario > ofertaGanadora) {
            montoARetirar = ofertaUsuario - ofertaGanadora;
            ofertas[msg.sender] = ofertaGanadora;
        }
        
        require(montoARetirar > 0, "No tienes fondos excedentes para retirar");
        
        // Transferir el exceso
        payable(msg.sender).transfer(montoARetirar);
        
        emit ReembolsoRealizado(msg.sender, montoARetirar);
    }

    /**
     * @dev Finaliza la subasta manualmente (solo propietario)
     */
    function finalizarSubasta() external soloPropiertario {
        require(!subastaFinalizada, "La subasta ya fue finalizada");
        
        subastaFinalizada = true;
        
        if (ganador != address(0)) {
            emit SubastaFinalizada(ganador, ofertaGanadora, block.timestamp);
        }
    }

    /**
     * @dev Devuelve los depósitos a los oferentes no ganadores (menos comisión del 2%)
     */
    function devolverDepositos() external subastaTerminada {
        require(oferentes.length > 0, "No hay oferentes");
        
        for (uint256 i = 0; i < oferentes.length; i++) {
            address oferente = oferentes[i];
            
            // Solo devolver a los no ganadores
            if (oferente != ganador && ofertas[oferente] > 0) {
                uint256 montoOriginal = ofertas[oferente];
                uint256 comision = (montoOriginal * COMISION) / 100;
                uint256 montoADevolver = montoOriginal - comision;
                
                // Resetear la oferta para evitar doble gasto
                ofertas[oferente] = 0;
                
                // Transferir el monto menos la comisión
                if (montoADevolver > 0) {
                    payable(oferente).transfer(montoADevolver);
                    emit ReembolsoRealizado(oferente, montoADevolver);
                }
            }
        }
    }

    /**
     * @dev Permite al propietario retirar las comisiones y la oferta ganadora
     */
    function retirarFondos() external soloPropiertario subastaTerminada {
        uint256 balance = address(this).balance;
        require(balance > 0, "No hay fondos para retirar");
        
        payable(propietario).transfer(balance);
    }

    /**
     * @dev Devuelve la información del ganador actual
     */
    function obtenerGanador() external view returns (address, uint256) {
        return (ganador, ofertaGanadora);
    }

    /**
     * @dev Devuelve la lista de oferentes y sus ofertas
     */
    function obtenerOfertas() external view returns (address[] memory, uint256[] memory) {
        uint256[] memory montosOfertas = new uint256[](oferentes.length);
        
        for (uint256 i = 0; i < oferentes.length; i++) {
            montosOfertas[i] = ofertas[oferentes[i]];
        }
        
        return (oferentes, montosOfertas);
    }

    /**
     * @dev Devuelve información general de la subasta
     */
    function obtenerInfoSubasta() external view returns (
        string memory descripcion,
        uint256 tiempoRestante,
        bool activa,
        address ganadorActual,
        uint256 ofertaActual,
        uint256 totalOferentes
    ) {
        uint256 tiempoRestante = 0;
        if (block.timestamp < tiempoFinalizacion && !subastaFinalizada) {
            tiempoRestante = tiempoFinalizacion - block.timestamp;
        }
        
        return (
            descripcionArticulo,
            tiempoRestante,
            (block.timestamp < tiempoFinalizacion && !subastaFinalizada),
            ganador,
            ofertaGanadora,
            oferentes.length
        );
    }

    /**
     * @dev Obtiene la oferta de un usuario específico
     */
    function obtenerOfertaUsuario(address usuario) external view returns (uint256) {
        return ofertas[usuario];
    }

    /**
     * @dev Función de emergencia para pausar la subasta
     */
    function pausarSubasta() external soloPropiertario {
        subastaFinalizada = true;
    }

    /**
     * @dev Función para verificar el balance del contrato
     */
    function obtenerBalanceContrato() external view returns (uint256) {
        return address(this).balance;
    }

    // Función fallback para recibir Ether
    receive() external payable {
        revert("Use la funcion ofertar() para enviar Ether");
    }

    fallback() external payable {
        revert("Funcion no encontrada");
    }
}