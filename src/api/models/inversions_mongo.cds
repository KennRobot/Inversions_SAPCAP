namespace inv;

//************************ESTREATEGIAS********************** */
entity strategies {
    key STRATEGY_ID               : String;
        USER_ID                   : String;
        TYPE                      : String;       // Ej: 'iron_condor'
        UNDERLYING                : String;       // Ej: 'SPY'
        OPENED_AT                 : DateTime;
        CLOSED_AT                 : DateTime;

        POSITIONS : {
            CALL_CREDIT_SPREAD : {
                SHORT_CALL      : Integer;
                LONG_CALL       : Integer;
            };
            PUT_CREDIT_SPREAD : {
                SHORT_PUT       : Integer;
                LONG_PUT        : Integer;
            };
        };

        PREMIUM_COLLECTED         : Decimal(10,2);

        RISK_INDICATORS_SNAPSHOT : {
            VIX                  : Decimal(5,2);
            RSI                  : Integer;
            PUT_CALL_RATIO       : Decimal(4,2);
        };

        NOTES                    : String;
};

//*************************USUARIOS ************************ */
entity Users {
  key idUser       : String(36);         // UUID o identificador único
      name         : String(100);
      lastName     : String(100);
      birthDate    : String(25);
      alias        : String(100);
      email        : String(255);
      phoneNumber  : String(20);
      departament  : String(100);
      street       : String(200);
      postalCode   : Integer;
      city         : String(100);
      state        : String(100);
      country      : String(100);
      createdAt : Timestamp;
      wallet    : Association to one Wallet;
}

entity Wallet {
  key id        : UUID;
      balance   : Decimal(15,2);
      currency  : String(3);
      movements : Composition of many Movements on movements.wallet = $self;
}

entity Movements {
  key movementId : String(36);
      wallet      : Association to Wallet;
      date        : Timestamp;
      type        : String(20);  //'deposit', 'trade', 'fee'
      amount      : Decimal(15,2);
      description : String(255);
}

//********************** SIMULACION ************************ */

// Entidad principal que representa una simulación completa
entity Simulation {
  key idSimulation     : String;          // ID único de la simulación
      idUser           : String;          // ID del usuario que ejecutó la simulación
      idStrategy       : String;          // ID de la estrategia utilizada
      simulationName   : String;          // Nombre de la simulación
      symbol           : String;          // Símbolo de la acción (e.g. "AAPL")
      specs            : String;          // Especificaciones (e.g. "SHORT:50&LONG:200")
      amount           : Decimal(15,2);   // Cantidad invertida al inicio
      startDate        : Date;            // Fecha de inicio de la simulación
      endDate          : Date;            // Fecha de término de la simulación
      percentageReturn : Decimal(10,6);   // Porcentaje de retorno (%)
      
      // Relaciones con subestructuras anidadas
      summary          : Composition of Summary on summary.simulation = $self;
      signals          : Composition of many Signals on signals.simulation = $self;
      chart_data       : Composition of many ChartData on chart_data.simulation = $self;
      detailRow        : Composition of many DetailRows on detailRow.simulation = $self;
}

// Contiene los resultados acumulados de la simulación
entity Summary {
  key simulation       : Association to Simulation; // FK a la simulación principal
      totalBoughtUnits : Decimal(15,4);             // Total de unidades compradas
      totalSoldUnits   : Decimal(15,4);             // Total de unidades vendidas
      remainingUnits   : Decimal(15,4);             // Unidades que quedaron al final
      finalCash        : Decimal(15,2);             // Efectivo disponible al final
      finalValue       : Decimal(15,2);             // Valor final del portafolio
      finalBalance     : Decimal(15,2);             // Balance total al cierre
      realProfit       : Decimal(15,2);             // Ganancia/pérdida neta
}

// Lista de señales de compra o venta detectadas durante la simulación
entity Signals {
  key idSignals        : UUID;                    // ID único de la señal
      simulation: Association to Simulation; // FK a la simulación
      date      : Date;                    // Fecha en que ocurrió la señal
      type      : String(10);              // Tipo: 'buy' o 'sell'
      price     : Decimal(10,2);           // Precio de la acción en ese momento
      reasoning : String(255);             // Razón detrás de la señal
      shares    : Decimal(15,6);           // Número de acciones compradas/vendidas
}

// Contiene los datos históricos por día con indicadores técnicos
entity ChartData {
  key idCharData        : UUID;                    // ID único del registro
      simulation: Association to Simulation; // FK a la simulación
      date      : Date;                    // Fecha del dato
      open      : Decimal(10,2);           // Precio de apertura
      high      : Decimal(10,2);           // Precio más alto
      low       : Decimal(10,2);           // Precio más bajo
      close     : Decimal(10,2);           // Precio de cierre
      volume    : Integer;                 // Volumen negociado
      indicators: Composition of many Indicators on indicators.chart = $self; // Subdocumento con indicadores
}

// Subdocumento de ChartData con valores como medias móviles
entity Indicators {
  key idIndicators     : UUID;                       // ID único del indicador
      chart  : Association to ChartData;   // FK a los datos de gráfica
      keyName    : String(50);        // Nombre del indicador (e.g. 'short_ma')
      value  : Decimal(15,6);              // Valor numérico del indicador
}

// Estructura para manejar cambios, auditorías o flags lógicos
entity DetailRows {
  key idDetailsRows         : UUID;                   // ID único
      simulation : Association to Simulation; // FK a la simulación
      ACTIVED    : Boolean;                // Si el registro está activo
      DELETED    : Boolean;                // Si el registro está marcado como eliminado
      detailRowReg : Composition of many DetailRowRegs on detailRowReg.detailRow = $self; // Subdocumentos de auditoría
}

// Subdocumento con datos de auditoría (registro de modificaciones)
entity DetailRowRegs {
  key idDetailRowRegs         : UUID;                   // ID único
      detailRow  : Association to DetailRows; // FK al detalle principal
      CURRENT    : Boolean;                // Si es la versión actual del registro
      REGDATE    : Date;                   // Fecha de registro
      REGTIME    : String;                 // Hora de registro (formato hh:mm:ss)
      REGUSER    : String(100);            // Usuario que hizo la modificación
}

//************************** PARA PRICES_HISTORY *****************8 */
entity PRICES_HISTORY {
    key CONTRACT_ID         : String;
        SYMBOL              : String;
        EXPIRATION          : Date;
        STRIKE              : Decimal(10,2);
        TYPE                : String;  // 'call' o 'put'
        LAST                : Decimal(10,2);
        MARK                : Decimal(10,2);
        BID                 : Decimal(10,2);
        BID_SIZE            : Integer;
        ASK                 : Decimal(10,2);
        ASK_SIZE            : Integer;
        VOLUME              : Integer;
        OPEN_INTEREST       : Integer;
        DATE                : Date;
        IMPLIED_VOLATILITY  : Decimal(10,5);
        DELTA               : Decimal(10,5);
        GAMMA               : Decimal(10,5);
        THETA               : Decimal(10,5);
        VEGA                : Decimal(10,5);
        RHO                 : Decimal(10,5);
}

