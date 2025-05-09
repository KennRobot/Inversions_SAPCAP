namespace inv;

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

entity Users {
  key idUser    : String(36);         // e.g., "user-001"
      name      : String(100);
      email     : String(255);
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
      type        : String(20);  // Enum: 'deposit', 'trade', 'fee'
      amount      : Decimal(15,2);
      description : String(255);
}

