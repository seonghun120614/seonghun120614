import styles from './Main.module.css';

export default function Main() {
    return (
        <div className = {styles.main}>
            <div className = {styles.list}>
                <div className = {styles.item}>
                    <h1>Park</h1>
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
                <div className={styles.menu} id={styles.profile}>Profile . </div>
                <div className={styles.menu} id={styles.github}>Github . </div>
                <div className={styles.menu} id={styles.instagram}>Instagram . </div>
                <div className={styles.menu} id={styles.blog}>Blog .</div>
                <div className={styles.menu} id={styles.youtube}>Youtube .</div>
                <div className={styles.menu} id={styles.email}>Email .</div>
                <div className={styles.menu} id={styles.visitlog}>Visitlog .</div>
            </div>
            
            <div id={styles.box}></div>

            <div id={styles.talkservice}>
                <div id={styles.conversation}>
                    <div className={styles.chat}>
                        익명138274<br/><br/>나의 오만함과 추함<br/>헤헤<br/>어디에 쓰는 물건인교
                    </div>
                    <div className={styles.chat}>
                        익명138274<br/><br/>사랑과 전쟁
                    </div>
                    <div className={styles.my}>
                        익명138274<br/><br/>Computer
                    </div>
                    <div className={styles.chat}>
                        익명138274<br/><br/>이모지 어케 함?
                    </div>
                </div>
                <div id={styles.input}>
                    <textarea id={styles.text}/>
                    <input id={styles.button} type="button"/>
                </div>
                
            </div>

        </div>
    );
}  