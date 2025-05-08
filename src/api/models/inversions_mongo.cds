//namespace del archivo
namespace inv;

//entidad de pricehistory
entity users{

    key ID      :Integer;
    USERNAME    :String;
    EMAIL       :String;
    PASSWORD_HASH  :String;
    CREATE_AT        :DateTime;

};

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
