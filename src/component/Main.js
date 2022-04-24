import styles from './Main.module.css';

export default function Main() {
    return (
        <div className = {styles.main}>
            <div className = {styles.container1}>

                <div className = {styles.item}>
                    <h1>Halo</h1>
                    <h1>Nebula</h1>
                </div>

                <div className = {styles.item}>
                    <h2>Play</h2>
                    <h2>Ground</h2>
                </div>

                <div className = {styles.item}>
                    <h3>Contents</h3>
                    <h3>Select One</h3>
                </div>

            </div>

            <div className = {styles.container2}>

                <div className = {styles.content}>
                </div>

                <div className = {styles.content}>
                </div>

                <div className = {styles.content}>
                </div>

                <div className = {styles.content}>
                </div>

            </div>

        </div>
    );
}  