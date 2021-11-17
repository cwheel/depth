import * as React from 'react'
import styled from '@emotion/styled';

const TANK_TYPES = {
    AL80: { name: 'AL80', double: false, caveFill: null, fill: 80 },
    AL40: { name: 'AL40', double: false, caveFill: null, fill: 40 },
    LP85: { name: 'LP85', double: true, caveFill: 109, fill: 85 },
    LP108: { name: 'LP108', double: true, caveFill: 147, fill: 108 },
};

const CloseButton = styled.div`
    border: none;
    outline: none;

    border-radius: 25px;
    height: 25px;
    width: 25px;
    background: wheat;
    display: flex;
    align-items: center;
    justify-content: center;

    background: #f1f1f1;
    color: #444;

    cursor: pointer;
`;

const TankRow = styled.div`
    display: flex;
    align-items: center;

    margin-bottom: 10px;

    select {
        margin-bottom: 0;
        margin-right: 10px;
        width: 100%;
    }
`;

const PlannerHeading = styled.div`
    display: flex;
`;

const CavefillControl = styled.div`
    flex: 1;
    display: flex;
    align-items: center;

    font-size: 10px;
    
    input {
        margin: 0;
        margin-right: 5px;
    }
`;

const Direction = styled.span`
    text-align: center;
    color: #c7c7c7;
`;

const AddTankButton = styled.div`
    cursor: pointer;
    font-size: 25px;
`;

const GasPlanner = ({ onChange }) => {
    const [tanks, setTanks] = React.useState([]);
    const [totalGas, setTotalGas] = React.useState(0);
    const [caveFilled, setCaveFilled] = React.useState(true);
    const isMounted = React.useRef(false);

    const addTank = () => {
        setTanks([...tanks, TANK_TYPES['AL80']]);
        setTotalGas(totalGas + TANK_TYPES['AL80'].fill);
    };

    const removeTank = (i) => {
        const newTanks = [...tanks];
        newTanks.splice(i, 1);

        setTotalGas((totalGas - (caveFilled ? tanks[i].caveFill ?? tanks[i].fill : tanks[i].fill) * (tanks[i].double ? 2 : 1)));
        setTanks(newTanks);
    };

    const setTankType = (i, newName) => {
        const newTanks = [...tanks];
        newTanks[i] = TANK_TYPES[newName];

        setTotalGas((totalGas - (caveFilled ? tanks[i].caveFill ?? tanks[i].fill : tanks[i].fill) * (tanks[i].double ? 2 : 1)) + (caveFilled ? newTanks[i].caveFill ?? newTanks[i].fill : newTanks[i].fill) * (newTanks[i].double ? 2 : 1));
        setTanks(newTanks);
    };

    const changeFillType = () => {
        const newFillType = !caveFilled;
        setCaveFilled(newFillType);

        setTotalGas(
            tanks.reduce((sum, tank) => sum + ((newFillType ? tank.caveFill ?? tank.fill : tank.fill) * (tank.double ? 2 : 1)), 0)
        );
    };

    React.useEffect(() => {
        if (isMounted.current && onChange) {
            onChange(totalGas, tanks);
        } else {
            isMounted.current = true;
        }
    }, [tanks, totalGas]);

    return <>
        <label>Gas {totalGas > 0 && ` - ${totalGas} cf.`}</label>
        <PlannerHeading>
            <CavefillControl>
                <input name="caveFill" type="checkbox" onChange={changeFillType} checked={caveFilled} />
                <label htmlFor="caveFill">Cave Filled</label>
            </CavefillControl>

            <AddTankButton onClick={addTank}>+</AddTankButton>
        </PlannerHeading>

        {tanks.length === 0 && <Direction>Hit + to add a tank</Direction>}

        {tanks.map((tank, i) => <TankRow>
            <select value={tank.name} onChange={e => setTankType(i, e.target.value)}>
                {Object.keys(TANK_TYPES).map(tank => <option value={tank}>{tank}{TANK_TYPES[tank].double ? ' [doubles]': ''}</option>)}
            </select>

            <CloseButton onClick={() => removeTank(i)}>&#10006;</CloseButton>
        </TankRow>)}
    </>;
};

export default GasPlanner;