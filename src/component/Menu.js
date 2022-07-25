import styles from './Menu.module.css';

export default function Menu() {
    return (
        <div className={styles.menu}>
            <ul>
                <li><a href="https://github.com/seonghun120614" target="_blank">Github.</a></li>
                <li><a href="https://www.instagram.com/park_nebula/">Instagram.</a></li>
                <li><a href="mailto:seonghun120614@gmail.com">Gmail.</a></li>
                <li><a href="https://seonghun120614.tistory.com/">Tistory.</a></li>
            </ul>
            <ul>
                <li>Games</li>
                <li>Tests</li>
                <li>Survey</li>
                <li>Chatting</li>
                <li>Q&A</li>
            </ul>
        </div>
    );
}