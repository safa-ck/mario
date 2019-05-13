const LEFT=37
const RIGHT=39
const UP=38


var Scoreboard=function(id='score'){
  this.ui=document.getElementById(id)
  this.score=0
  this.plus=()=>{
    this.score+=10
    this.ui.innerHTML=`Score:${this.score}`
  }
}

var Mario=function(id='mario'){
  this.health=100
  this.jumping=false
  this.direction=RIGHT
  this.maximum_force=50
  this.dead=false
  this.ui=document.getElementById(id)
  this.stand=()=>{
    if(this.direction==LEFT){
      this.stand_left()
    }else{
      this.stand_right()
    }
  }
  this.stand_left=()=>{
    this.ui.style.background=`url('images/mario_left.jpg')`
  }
  this.stand_right=()=>{
    this.ui.style.background=`url('images/mario_right.jpg')`
  }
  this.run_left=()=>{
    this.ui.style.background=`url('images/mario_left_running.jpg')`
  }
  this.run_right=()=>{
    this.ui.style.background=`url('images/mario_right_running.jpg')`
  }
  this.left=(pos=false)=>{
    let current_left=parseInt(getComputedStyle(this.ui).left)||0
    if(pos!==false){
      if(pos>0){
        this.direction=RIGHT
        this.run_right()
      }else{
        this.direction=LEFT
        this.run_left()
      }
      this.ui.style.left=(current_left+pos)+"px"
    }
    return current_left
  }
  this.top=(pos=false)=>{
    let current_top=parseInt(getComputedStyle(this.ui).top)||0
    if(pos!==false){
      this.ui.style.top=(current_top+pos)+"px"
    }
    return current_top
  }
  this.movable=(direction=RIGHT)=>{
    if(this.jumping==false && !this.dead){
      if(direction==LEFT){
        return this.left()>0
      }
      else if(direction==RIGHT){
        return (window.innerWidth-this.left()-10)>=50
      }
      else if(direction==UP){
        return this.top()-10>0
      }
    }
  }
  this.moveLeft=()=>{
    if(this.movable(LEFT)){
      this.left(-10)
    }
  }
  this.moveRight=()=>{
    if(this.movable(RIGHT)){
      this.left(10)
    }
  }
  this.jump=()=>{
    if(this.movable(UP)){
      this.jumping=true
      let initial_position=this.top()
      const gravity=10
      let force=this.maximum_force
      let go=()=>{
        if(this.direction==LEFT){
          this.run_left()
        }else{
          this.run_right()
        }
        this.top(-force)
        let left_force=this.direction==LEFT?-10:10
        this.left(left_force)
        force-=gravity
        let current_position=this.top()
        if(current_position<initial_position){
          setTimeout(go,100)
        }else{
          this.top(initial_position-current_position)
          this.jumping=false
          this.stand()
        }
      }
      go()
    }
  }
  this.die=()=>{
    this.dead=true
    this.health=0
    this.ui.style.opacity=0.1
  }
  this.jump()
}

var Bullet=function(target=null,id='bullet'){
  if(typeof target == "object"){
    this.ui=document.getElementById(id)
    this.direction=LEFT
    this.speed=40
    this.dead=false
    this.timeout=false
    this.movable=(direction=RIGHT)=>{
      if(this.jumping==false){
        if(direction==LEFT){
          return this.left()>0
        }
        else if(direction==RIGHT){
          return (window.innerWidth-this.left()-10)>=50
        }
      }
    }
    this.run_left=()=>{
      this.ui.style.background=`url('images/bullet_left.png')`
    }
    this.run_right=()=>{
      this.ui.style.background=`url('images/bullet_right.png')`
    }
    this.left=(pos=false)=>{
      let current_left=parseInt(getComputedStyle(this.ui).left)||0
      if(pos!==false){
        if(pos>0){
          this.direction=RIGHT
          this.run_right()
        }else{
          this.direction=LEFT
          this.run_left()
        }
        this.ui.style.left=(current_left+pos)+"px"
      }
      return current_left
    }
    this.top=(pos=false)=>{
      let current_top=parseInt(getComputedStyle(this.ui).top)||0
      if(pos!==false){
        this.ui.style.top=(current_top+pos)+"px"
      }
      return current_top
    }
    this.attack=()=>{
      clearTimeout(this.timeout)
      if(target.health && !this.dead){
        if(this.direction==LEFT){
          this.left(-this.speed)
        }else{
          this.left(this.speed)
        }
        this.timeout=setTimeout(this.attack,100)
      }else{
        this.die()
      }
    }
    this.die=()=>{
      this.dead=true
      this.ui.style.display='none'
    }
    this.regenerate=()=>{
      clearTimeout(this.timeout)
      this.dead=false
      let random=Math.random()
      if(random<0.5){
        random=0
      }else if(random<0.7){
        random=window.innerWidth+50
      }else{
        random=Math.random()*window.innerWidth
      }
      this.ui.style.left=random+"px"
      this.ui.style.display='block'
      this.run()
    }
    this.run=()=>{
      this.direction=(this.left()-target.left())<0?RIGHT:LEFT
      this.attack()
    }
    this.run()
  }
}

document.addEventListener('keydown',function(e){
  if(e.keyCode==RIGHT){
    engine.mario.moveRight()
  }
  if(e.keyCode==LEFT){
    engine.mario.moveLeft()
  }
  if(e.keyCode==UP){
    engine.mario.jump()
  }
})
document.addEventListener('keyup',function(e){
  engine.mario.stand()
})

var Engine=function(){
  this.timeout=null
  this.mario=new Mario()
  this.bullet=new Bullet(this.mario)
  this.scoreboard=new Scoreboard()

  this.collision_check=()=>{
    let left_diff=Math.abs(this.mario.left()-this.bullet.left())
    let top_diff=Math.abs(this.mario.top()-this.bullet.top())
    let mario_dead=left_diff<=50 && top_diff<50
    let bullet_dead=(left_diff<=50 && top_diff==50)
    let bullet_missed=this.bullet.left()+50<0 || this.bullet.left()+50>window.innerWidth
    if(bullet_dead){
      this.bullet.die()
      this.scoreboard.plus()
      this.bullet.regenerate()
    }else if(mario_dead){
      this.mario.die()
    }else if(bullet_missed){
      this.bullet.regenerate()
    }

  }
  this.start=()=>{
    clearTimeout(this.timeout)
    this.collision_check()
    this.timeout=setTimeout(this.start,50)
  }
}

var engine=new Engine()
engine.start()
