import ArticleTypeEntity from 'src/models/article-type.entity';
import { isFieldExistOtherwiseCreate } from './field-existance';

enum TAGS {
  MUSIC = 'Музыка',
  GUITAR = 'Гитара',
  SONGWRITING = 'Написание песен',
  SOUND_PRODUCTION = 'Звукорежиссура',
  TECHNOLOGY = 'Технологии',
  PROGRAMMING = 'Программирование',
  WEB_DEVELOPMENT = 'Веб-разработка',
  FRONTEND = 'Фронтенд',
  BACKEND = 'Бэкенд',
  NODEJS = 'Node.js',
  REACT = 'React',
  NESTJS = 'NestJS',
  SOFTWARE_ENGINEERING = 'Инженерия ПО',
  PROJECT_MANAGEMENT = 'Управление проектами',
  STARTUPS = 'Стартапы',
  EDUCATION = 'Образование',
  SELF_DEVELOPMENT = 'Саморазвитие',
  TUTORIALS = 'Уроки',
  CAREER = 'Карьера',
  INTERNSHIPS = 'Стажировки',
  INNOVATION = 'Инновации',
  PERSONAL_FINANCE = 'Личные финансы',
  INVESTING = 'Инвестирование',
  PRODUCTIVITY = 'Продуктивность',
  HEALTHY_LIFESTYLE = 'Здоровый образ жизни',
  FITNESS = 'Фитнес',
  MINDFULNESS = 'Осознанность',
  CODING_CHALLENGES = 'Кодинг-челленджи',
  OPEN_SOURCE = 'Open Source',
  AI = 'Искусственный интеллект',
  MACHINE_LEARNING = 'Машинное обучение',
  CLOUD_COMPUTING = 'Облачные технологии',
  CYBERSECURITY = 'Кибербезопасность',
  ANIME = 'Аниме',
  MOVIES = 'Кино и фильмы',
}

export default function defineTypes() {
  Object.values(TAGS).map(val => {
    isFieldExistOtherwiseCreate(val, ArticleTypeEntity);
  });
}
