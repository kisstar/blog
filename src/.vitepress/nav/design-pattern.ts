import { type DefaultTheme } from 'vitepress';

const designPattern: DefaultTheme.SidebarItem[] = [
  {
    text: '基础概念',
    items: [
      { text: '设计模式', link: 'index.html' },
      { text: '面向对象设计', link: 'oop.html' },
      { text: 'UML 类图和时序图', link: 'uml-diagram.html' },
      { text: '设计原则', link: 'design-principle.html' }
    ]
  },
  {
    text: '创建型模式',
    items: [
      { text: '简单工厂模式', link: 'simple-factory.html' },
      { text: '工厂方法模式', link: 'factory-method.html' },
      { text: '抽象工厂模式', link: 'abstract-factory.html' }
    ]
  },
  {
    text: '结构型模式',
    items: [
      { text: '桥接模式', link: 'bridge.html' },
      { text: '适配器模式', link: 'adapter.html' },
      { text: '代理模式', link: 'proxy.html' },
      { text: '组合模式', link: 'composite.html' }
    ]
  },
  {
    text: '行为型模式',
    items: [
      { text: '责任链模式', link: 'chain-of-responsibility.html' },
      { text: '中介者模式', link: 'mediator.html' },
      { text: '访问者模式', link: 'visitor.html' },
      { text: '状态模式', link: 'state.html' }
    ]
  }
];

export default designPattern;
